import asyncio
import hashlib
import html
import json
import logging
import os
import secrets
from contextlib import asynccontextmanager
from typing import Literal, Optional
from urllib.parse import quote, urljoin
from uuid import UUID

from fastapi import FastAPI, Header, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse, Response
from psycopg import InterfaceError, OperationalError
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb

from database import init_db, pool
from models import WishCreate, WishResponse, WishStats, WishUpdate

logger = logging.getLogger(__name__)
TRANSIENT_DATABASE_ERRORS = (OperationalError, InterfaceError, ConnectionResetError, OSError)


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
frontend_origin = allowed_origins[0] if allowed_origins else os.getenv(
    "FRONTEND_FALLBACK_ORIGIN",
    "https://loy-jai.vercel.app",
)
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
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
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
    offset: int = Query(default=0, ge=0),
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
                    ORDER BY created_at DESC, id DESC
                    LIMIT %s
                    OFFSET %s
                    """,
                    (item_type, limit, offset),
                )
            else:
                await cur.execute(
                    """
                    SELECT id, item_type, sender_name, wish_text, customization, created_at
                    FROM wishes
                    ORDER BY created_at DESC, id DESC
                    LIMIT %s
                    OFFSET %s
                    """,
                    (limit, offset),
                )
            rows = await cur.fetchall()
            return rows


def parse_wish_id(wish_id: str) -> UUID | None:
    try:
        return UUID(wish_id)
    except (ValueError, AttributeError, TypeError):
        return None


def frontend_wish_url(wish_id: UUID) -> str:
    frontend_base_url = frontend_origin.rstrip("/") + "/"
    return urljoin(frontend_base_url, f"?wish={quote(str(wish_id))}")


async def fetch_wish_by_id(wish_id: UUID):
    for attempt in range(2):
        try:
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
                    return await cur.fetchone()
        except TRANSIENT_DATABASE_ERRORS as error:
            if attempt == 0:
                logger.warning(
                    "Transient database error fetching wish %s; retrying once",
                    wish_id,
                    exc_info=True,
                )
                await asyncio.sleep(0.3)
                continue
            logger.exception("Database error fetching wish %s after retry", wish_id)
            raise HTTPException(status_code=503, detail="Wish service is temporarily unavailable") from error
        except Exception as error:
            logger.exception("Unexpected database error fetching wish %s", wish_id)
            raise HTTPException(status_code=503, detail="Wish service is temporarily unavailable") from error
    return None


@app.get("/w/{wish_id}", response_class=HTMLResponse)
async def wish_preview(wish_id: str, request: Request):
    wish_uuid = parse_wish_id(wish_id)
    if wish_uuid is None:
        return JSONResponse({"detail": "Wish not found"}, status_code=404)

    try:
        wish = await fetch_wish_by_id(wish_uuid)
    except HTTPException as error:
        if error.status_code != 503:
            raise
        return RedirectResponse(frontend_wish_url(wish_uuid), status_code=307)

    if wish is None:
        return JSONResponse({"detail": "Wish not found"}, status_code=404)

    sender = html.escape(wish["sender_name"], quote=True)
    wish_text = html.escape(wish["wish_text"], quote=True)
    item_label = (
        "ลอยกระทง (floated a krathong)"
        if wish["item_type"] == "krathong"
        else "ปล่อยโคมลอย (released a lantern)"
    )
    title = f"{sender} {item_label} on ลอยใจ (Loy Jai)"
    preview_url = html.escape(str(request.url), quote=True)
    frontend_base_url = frontend_origin.rstrip("/") + "/"
    redirect_url = urljoin(frontend_base_url, f"?wish={quote(str(wish_uuid))}")
    safe_redirect_url = json.dumps(redirect_url).replace("<", "\\u003c")
    image_url = html.escape(
        os.getenv("OG_IMAGE_URL", urljoin(frontend_base_url, "assets/images/og-preview.png")),
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
    owner_token_hash = hashlib.sha256(payload.owner_token.encode("utf-8")).hexdigest()
    async with pool.connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                """
                INSERT INTO wishes (item_type, sender_name, wish_text, customization, owner_token_hash)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, item_type, sender_name, wish_text, customization, created_at
                """,
                (
                    payload.item_type,
                    payload.sender_name,
                    payload.wish_text,
                    Jsonb(payload.customization),
                    owner_token_hash,
                ),
            )
            row = await cur.fetchone()
        await conn.commit()
        return row


async def require_wish_owner(cur, wish_id: UUID, owner_token: str | None) -> None:
    if not owner_token:
        raise HTTPException(status_code=403, detail="A valid wish ownership token is required")
    await cur.execute(
        "SELECT owner_token_hash FROM wishes WHERE id = %s FOR UPDATE",
        (wish_id,),
    )
    row = await cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Wish not found")
    expected_hash = row["owner_token_hash"]
    provided_hash = hashlib.sha256(owner_token.encode("utf-8")).hexdigest()
    if not expected_hash or not secrets.compare_digest(expected_hash, provided_hash):
        raise HTTPException(status_code=403, detail="A valid wish ownership token is required")


@app.patch("/api/wishes/{wish_id}", response_model=WishResponse)
async def update_wish(
    wish_id: UUID,
    payload: WishUpdate,
    owner_token: str | None = Header(default=None, alias="X-Wish-Owner-Token"),
):
    async with pool.connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            await require_wish_owner(cur, wish_id, owner_token)
            await cur.execute(
                """
                UPDATE wishes
                SET sender_name = %s, wish_text = %s, customization = %s
                WHERE id = %s
                RETURNING id, item_type, sender_name, wish_text, customization, created_at
                """,
                (
                    payload.sender_name,
                    payload.wish_text,
                    Jsonb(payload.customization),
                    wish_id,
                ),
            )
            row = await cur.fetchone()
        await conn.commit()
        return row


@app.delete("/api/wishes/{wish_id}", status_code=204)
async def delete_wish(
    wish_id: UUID,
    owner_token: str | None = Header(default=None, alias="X-Wish-Owner-Token"),
):
    async with pool.connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            await require_wish_owner(cur, wish_id, owner_token)
            await cur.execute("DELETE FROM wishes WHERE id = %s", (wish_id,))
        await conn.commit()
    return Response(status_code=204)


@app.get("/api/wishes/{wish_id}", response_model=WishResponse)
async def get_single_wish(wish_id: str):
    wish_uuid = parse_wish_id(wish_id)
    if wish_uuid is None:
        raise HTTPException(status_code=404, detail="Wish not found")
    wish = await fetch_wish_by_id(wish_uuid)
    if wish is None:
        raise HTTPException(status_code=404, detail="Wish not found")
    return wish


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