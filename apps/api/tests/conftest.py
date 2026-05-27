"""Pytest fixtures — test DB, Redis, and AsyncClient."""

from __future__ import annotations

import asyncio
import os
from typing import AsyncGenerator
from unittest.mock import AsyncMock, MagicMock

import asyncpg
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

# Set testing env before importing app modules
os.environ.setdefault("APP_ENV", "testing")
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+asyncpg://manabogo:manabogo_dev@localhost/manabogo_test",
)
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/1")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-minimum-32-characters-long")

from main import create_app  # noqa: E402
import app.database as db_module  # noqa: E402


TEST_DSN = os.environ["DATABASE_URL"].replace("postgresql+asyncpg://", "postgresql://")


@pytest.fixture(scope="session")
def event_loop():
    """Use a single event loop for the whole session."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def test_db_pool():
    """Create a test database connection pool for the session."""
    pool = await asyncpg.create_pool(dsn=TEST_DSN, min_size=1, max_size=5)
    yield pool
    await pool.close()


@pytest_asyncio.fixture(autouse=True)
async def clean_tables(test_db_pool):
    """Truncate all relevant tables before each test."""
    async with test_db_pool.acquire() as conn:
        await conn.execute("""
            TRUNCATE TABLE
                two_factor_backup_codes,
                user_sessions,
                refresh_tokens,
                password_reset_tokens,
                email_verification_tokens,
                oauth_identities,
                users
            RESTART IDENTITY CASCADE
        """)
    yield


@pytest_asyncio.fixture
async def mock_redis():
    """In-memory mock Redis for rate-limit tests."""
    store: dict = {}

    redis = MagicMock()

    async def _get(key):
        return store.get(key)

    async def _set(key, value, ex=None):
        store[key] = value

    async def _incr(key):
        store[key] = int(store.get(key, 0)) + 1
        return store[key]

    async def _expire(key, seconds):
        pass  # no-op in tests

    async def _delete(key):
        store.pop(key, None)

    class MockPipeline:
        def __init__(self):
            self._cmds = []

        def incr(self, key):
            self._cmds.append(("incr", key))
            return self

        def expire(self, key, seconds):
            self._cmds.append(("expire", key, seconds))
            return self

        async def execute(self):
            results = []
            for cmd in self._cmds:
                if cmd[0] == "incr":
                    store[cmd[1]] = int(store.get(cmd[1], 0)) + 1
                    results.append(store[cmd[1]])
                elif cmd[0] == "expire":
                    results.append(True)
            return results

    redis.get = _get
    redis.set = _set
    redis.incr = _incr
    redis.expire = _expire
    redis.delete = _delete
    redis.pipeline = lambda: MockPipeline()
    return redis, store


@pytest_asyncio.fixture
async def client(test_db_pool, mock_redis):
    """AsyncClient with mocked DB pool and Redis."""
    redis_mock, _ = mock_redis
    db_module._pool = test_db_pool
    db_module._redis = redis_mock

    fastapi_app = create_app()
    async with AsyncClient(
        transport=ASGITransport(app=fastapi_app),
        base_url="http://test",
    ) as ac:
        yield ac


@pytest_asyncio.fixture
async def db_conn(test_db_pool):
    """Yield a direct DB connection for assertions."""
    async with test_db_pool.acquire() as conn:
        yield conn


# ── Helper: create a user directly in DB ──────────────────────

async def create_test_user(
    conn: asyncpg.Connection,
    email: str = "test@example.com",
    password: str = "TestPass123!",
    role: str = "user",
    email_verified: bool = True,
) -> dict:
    from app.auth.utils import hash_password
    pw_hash = hash_password(password)
    row = await conn.fetchrow(
        """
        INSERT INTO users (email, password_hash, role, email_verified)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, role, email_verified
        """,
        email,
        pw_hash,
        role,
        email_verified,
    )
    return dict(row)
