import os
from dotenv import load_dotenv
from psycopg_pool import AsyncConnectionPool

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set in environment variables.")

# Neon scales to zero when idle; min_size=1, max_size=10 keeps cold-start latency low
pool = AsyncConnectionPool(
    conninfo=DATABASE_URL,
    min_size=1,
    max_size=10,
    max_lifetime=240,
    check=AsyncConnectionPool.check_connection,
    open=False,
)

INIT_SQL = """
CREATE TABLE IF NOT EXISTS wishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_type VARCHAR(16) NOT NULL CHECK (item_type IN ('lantern', 'krathong')),
    sender_name VARCHAR(60) NOT NULL DEFAULT 'Anonymous',
    wish_text VARCHAR(280) NOT NULL,
    customization JSONB NOT NULL DEFAULT '{}'::jsonb,
    owner_token_hash CHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS owner_token_hash CHAR(64);
CREATE INDEX IF NOT EXISTS idx_wishes_created_at ON wishes (created_at DESC);
"""


async def init_db() -> None:
    async with pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute(INIT_SQL)
        await conn.commit()