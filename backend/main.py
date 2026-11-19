### DATABASE_URL=postgresql://your_user:your_password@ep-your-project-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
### FRONTEND_ORIGIN=http://localhost:5173

import os
from contextlib import asynccontextmanager
from typing import Literal, Optional
from uuid import UUID

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
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

allowed_origins = [
    os.getenv("FRONTEND_ORIGIN", "http://localhost:5173"),
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.get("/api/wishes", response_model=list[WishResponse])
async def get_wishes(
    limit: int = Query(default=50, ge=1, le=200),
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