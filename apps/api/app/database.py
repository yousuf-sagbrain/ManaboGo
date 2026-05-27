"""asyncpg connection pool setup with FastAPI lifespan."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

import asyncpg
import redis.asyncio as aioredis
from fastapi import FastAPI

from app.config import settings

# Module-level pool references (set during lifespan startup)
_pool: asyncpg.Pool | None = None
_redis: aioredis.Redis | None = None  # type: ignore[type-arg]


async def get_pool() -> asyncpg.Pool:
    """Return the active asyncpg pool (raises if not initialised)."""
    if _pool is None:
        raise RuntimeError("Database pool is not initialised. Call create_pool() first.")
    return _pool


async def get_redis() -> aioredis.Redis:  # type: ignore[type-arg]
    """Return the active Redis client (raises if not initialised)."""
    if _redis is None:
        raise RuntimeError("Redis client is not initialised. Call create_redis() first.")
    return _redis


async def create_pool() -> asyncpg.Pool:
    """Create and return a new asyncpg connection pool."""
    # asyncpg expects postgresql:// not postgresql+asyncpg://
    dsn = settings.database_url.replace("postgresql+asyncpg://", "postgresql://")
    return await asyncpg.create_pool(
        dsn=dsn,
        min_size=2,
        max_size=10,
        command_timeout=60,
    )


async def create_redis() -> aioredis.Redis:  # type: ignore[type-arg]
    """Create and return a new Redis client."""
    return await aioredis.from_url(
        settings.redis_url,
        encoding="utf-8",
        decode_responses=True,
    )


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """FastAPI lifespan: open pool on startup, close on shutdown."""
    global _pool, _redis

    _pool = await create_pool()
    _redis = await create_redis()

    yield  # application runs here

    await _pool.close()
    await _redis.aclose()


async def get_db_conn() -> AsyncGenerator[asyncpg.Connection, None]:
    """FastAPI dependency: yields a connection from the pool."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        yield conn
