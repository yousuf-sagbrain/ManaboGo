"""User account management business logic."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from uuid import UUID

import asyncpg

from app.auth.utils import hash_password, verify_password, validate_password_strength


async def get_user_profile(conn: asyncpg.Connection, user_id: UUID) -> dict:
    row = await conn.fetchrow(
        """
        SELECT id, email, full_name, avatar_url, role, email_verified,
               two_factor_secret IS NOT NULL as two_factor_enabled,
               is_active, created_at
        FROM users WHERE id = $1 AND deleted_at IS NULL
        """,
        user_id,
    )
    if not row:
        raise ValueError("user_not_found")
    return dict(row)


async def update_user_profile(
    conn: asyncpg.Connection,
    user_id: UUID,
    full_name: str | None,
    avatar_url: str | None,
) -> dict:
    row = await conn.fetchrow(
        """
        UPDATE users
        SET full_name = COALESCE($1, full_name),
            avatar_url = COALESCE($2, avatar_url),
            updated_at = now()
        WHERE id = $3 AND deleted_at IS NULL
        RETURNING id, email, full_name, avatar_url, role, email_verified,
                  two_factor_secret IS NOT NULL as two_factor_enabled,
                  is_active, created_at
        """,
        full_name,
        avatar_url,
        user_id,
    )
    if not row:
        raise ValueError("user_not_found")
    return dict(row)


async def change_password(
    conn: asyncpg.Connection,
    user_id: UUID,
    current_password: str,
    new_password: str,
) -> None:
    user = await conn.fetchrow(
        "SELECT password_hash FROM users WHERE id = $1 AND deleted_at IS NULL",
        user_id,
    )
    if not user:
        raise ValueError("user_not_found")
    if not verify_password(current_password, user["password_hash"]):
        raise ValueError("invalid_credentials")

    valid, error_msg = validate_password_strength(new_password)
    if not valid:
        raise ValueError(f"weak_password:{error_msg}")

    pw_hash = hash_password(new_password)
    await conn.execute(
        "UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2",
        pw_hash,
        user_id,
    )


async def get_user_sessions(conn: asyncpg.Connection, user_id: UUID) -> list[dict]:
    rows = await conn.fetch(
        """
        SELECT id, user_agent, ip_address::text, last_seen, created_at
        FROM user_sessions
        WHERE user_id = $1
        ORDER BY last_seen DESC
        """,
        user_id,
    )
    return [dict(r) for r in rows]


async def revoke_session(
    conn: asyncpg.Connection,
    user_id: UUID,
    session_id: UUID,
) -> None:
    session = await conn.fetchrow(
        "SELECT id, refresh_token_id FROM user_sessions WHERE id = $1 AND user_id = $2",
        session_id,
        user_id,
    )
    if not session:
        raise ValueError("session_not_found")

    async with conn.transaction():
        await conn.execute("DELETE FROM user_sessions WHERE id = $1", session_id)
        if session["refresh_token_id"]:
            await conn.execute(
                "UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1",
                session["refresh_token_id"],
            )


async def soft_delete_user(conn: asyncpg.Connection, user_id: UUID) -> None:
    """Soft-delete user: sets deleted_at = now() + 30 days grace period."""
    grace_period = datetime.now(timezone.utc) + timedelta(days=30)
    await conn.execute(
        "UPDATE users SET deleted_at = $1, is_active = FALSE, updated_at = now() WHERE id = $2",
        grace_period,
        user_id,
    )
    # Revoke all refresh tokens
    await conn.execute(
        "UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL",
        user_id,
    )
