import html
import json
import os
from contextlib import asynccontextmanager
from typing import Literal, Optional
from urllib.parse import quote, urljoin
from uuid import UUID

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse, Response
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb

from database import init_db, pool
from models import WishCreate, WishResponse, WishStats


@asynccontextmanager
async def lifespan(app: FastAPI):
    await pool.open()
    await init_db()
    yield
    await pool.close()


app = FastAPI(title="Loy Jai API", version="1.0.0", lifespan=lifespan)

configured_origins = os.getenv("FRONTEND_ORIGIN", "")
allowed_origins = [
    origin
    for origin in (
        value.strip().rstrip("/")
        for value in configured_origins.split(",")
    )
    if origin
]
if not allowed_origins:
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.api_route("/", methods=["GET", "HEAD"], include_in_schema=False)
async def root(request: Request):
    response = JSONResponse({"service": "LoyJai API", "status": "ok"})
    if request.method == "HEAD":
        return Response(status_code=response.status_code, headers=response.headers)
    return response


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.get("/api/wishes", response_model=list[WishResponse])
async def get_wishes(
    limit: int = Query(default=50, ge=1, le=50),
    item_type: Optional[Literal["lantern", "krathong"]] = None,
):
    async with pool.connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            if item_type:
                await cur.execute(
                    """
                    SELECT id, item_type, sender_name, wish_text, customization, created_at
                    FROM wishes
                    WHERE item_type = %s
                    ORDER BY created_at DESC
                    LIMIT %s
                    """,
                    (item_type, limit),
                )
            else:
                await cur.execute(
                    """
                    SELECT id, item_type, sender_name, wish_text, customization, created_at
                    FROM wishes
                    ORDER BY created_at DESC
                    LIMIT %s
                    """,
                    (limit,),
                )
            rows = await cur.fetchall()
            return rows


@app.get("/w/{wish_id}", response_class=HTMLResponse)
async def wish_preview(wish_id: str, request: Request):
    try:
        wish_uuid = UUID(wish_id)
    except ValueError:
        frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000").rstrip("/") + "/"
        return RedirectResponse(frontend_origin, status_code=302)

    async with pool.connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                """
                SELECT id, item_type, sender_name, wish_text
                FROM wishes
                WHERE id = %s
                """,
                (wish_uuid,),
            )
            wish = await cur.fetchone()

    frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000").rstrip("/") + "/"
    if not wish:
        return RedirectResponse(frontend_origin, status_code=302)

    sender = html.escape(wish["sender_name"], quote=True)
    wish_text = html.escape(wish["wish_text"], quote=True)
    item_label = (
        "ลอยกระทง (floated a krathong)"
        if wish["item_type"] == "krathong"
        else "ปล่อยโคมลอย (released a lantern)"
    )
    title = f"{sender} {item_label} on ลอยใจ (Loy Jai)"
    preview_url = html.escape(str(request.url), quote=True)
    redirect_url = urljoin(frontend_origin, f"?wish={quote(str(wish_uuid))}")
    safe_redirect_url = json.dumps(redirect_url).replace("<", "\\u003c")
    image_url = html.escape(
        os.getenv("OG_IMAGE_URL", urljoin(frontend_origin, "images/skyline.png")),
        quote=True,
    )

    page = f"""<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{wish_text}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{wish_text}">
  <meta property="og:url" content="{preview_url}">
  <meta property="og:image" content="{image_url}">
  <meta property="og:site_name" content="ลอยใจ (Loy Jai)">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{wish_text}">
  <meta name="twitter:image" content="{image_url}">
  <meta http-equiv="refresh" content="0;url={html.escape(redirect_url, quote=True)}">
</head>
<body>
  <p>{title}</p>
  <p>{wish_text}</p>
  <script>window.location.replace({safe_redirect_url});</script>
</body>
</html>"""
    return HTMLResponse(page)


@app.post("/api/wishes", response_model=WishResponse, status_code=201)
async def create_wish(payload: WishCreate):
    async with pool.connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                """
                INSERT INTO wishes (item_type, sender_name, wish_text, customization)
                VALUES (%s, %s, %s, %s)
                RETURNING id, item_type, sender_name, wish_text, customization, created_at
                """,
                (
                    payload.item_type,
                    payload.sender_name,
                    payload.wish_text,
                    Jsonb(payload.customization),
                ),
            )
            row = await cur.fetchone()
        await conn.commit()
        return row


@app.get("/api/wishes/{wish_id}", response_model=WishResponse)
async def get_single_wish(wish_id: UUID):
    async with pool.connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                """
                SELECT id, item_type, sender_name, wish_text, customization, created_at
                FROM wishes
                WHERE id = %s
                """,
                (wish_id,),
            )
            row = await cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Wish not found")
            return row


@app.get("/api/stats", response_model=WishStats)
async def get_stats():
    async with pool.connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                """
                SELECT
                    COUNT(*)::int AS total,
                    COUNT(*) FILTER (WHERE item_type = 'lantern')::int AS lanterns,
                    COUNT(*) FILTER (WHERE item_type = 'krathong')::int AS krathongs
                FROM wishes
                """
            )
            return await cur.fetchone()