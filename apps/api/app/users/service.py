"""User account management business logic."""

from __future__ import annotations

import mimetypes
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import UUID

import asyncpg

from app.auth.utils import hash_password, verify_password, validate_password_strength
from app.config import settings

# Local avatar storage — used until Cloudflare R2 is wired (Task 31)
_AVATAR_DIR = Path(__file__).resolve().parent.parent.parent / "uploads" / "avatars"
_ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp"}
_MAX_BYTES = 2 * 1024 * 1024  # 2 MB


async def save_avatar(
    conn: asyncpg.Connection,
    user_id: UUID,
    content_type: str,
    data: bytes,
) -> str:
    """
    Validate, persist to local disk, update users.avatar_url, return the URL.
    Raises ValueError on bad mime type or oversized file.
    When R2 is ready (Task 31), replace the write block with an S3 put_object call
    and return the R2 public URL instead.
    """
    if content_type not in _ALLOWED_MIME:
        raise ValueError("invalid_mime")
    if len(data) > _MAX_BYTES:
        raise ValueError("file_too_large")

    ext = mimetypes.guess_extension(content_type) or ".jpg"
    # .jpe is the stdlib guess for image/jpeg — normalise it
    if ext == ".jpe":
        ext = ".jpg"

    filename = f"{uuid.uuid4().hex}{ext}"
    _AVATAR_DIR.mkdir(parents=True, exist_ok=True)
    (_AVATAR_DIR / filename).write_bytes(data)

    avatar_url = f"{settings.api_url}/static/avatars/{filename}"
    await conn.execute(
        "UPDATE users SET avatar_url = $1, updated_at = now() WHERE id = $2",
        avatar_url,
        user_id,
    )
    return avatar_url


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


async def build_gdpr_export(conn: asyncpg.Connection, user_id: UUID) -> dict:
    """Return all personal data held for a user as a plain dict."""
    profile = await conn.fetchrow(
        """
        SELECT id, email, full_name, avatar_url, role, email_verified,
               two_factor_secret IS NOT NULL AS two_factor_enabled,
               is_active, created_at
        FROM users WHERE id = $1 AND deleted_at IS NULL
        """,
        user_id,
    )
    if not profile:
        raise ValueError("user_not_found")

    sessions = await conn.fetch(
        """
        SELECT user_agent, ip_address::text, last_seen, created_at
        FROM user_sessions WHERE user_id = $1 ORDER BY last_seen DESC
        """,
        user_id,
    )

    srs_progress = await conn.fetch(
        """
        SELECT v.kanji, v.reading, v.meaning, p.srs_level, p.ease_factor,
               p.interval_days, p.next_review_at, p.review_count, p.correct_count,
               p.last_reviewed
        FROM user_progress p
        JOIN vocabulary v ON v.id = p.vocab_id
        WHERE p.user_id = $1
        ORDER BY p.srs_level DESC, p.last_reviewed DESC NULLS LAST
        """,
        user_id,
    )

    lesson_progress = await conn.fetch(
        """
        SELECT l.title, lp.score_pct, lp.completed_at
        FROM lesson_progress lp
        JOIN lessons l ON l.id = lp.lesson_id
        WHERE lp.user_id = $1
        ORDER BY lp.completed_at DESC
        """,
        user_id,
    )

    mock_results = await conn.fetch(
        """
        SELECT mt.title AS test_title, mr.score, mr.max_score, mr.passed,
               mr.section_scores, mr.time_taken_secs, mr.completed_at
        FROM mock_results mr
        JOIN mock_tests mt ON mt.id = mr.test_id
        WHERE mr.user_id = $1
        ORDER BY mr.completed_at DESC
        """,
        user_id,
    )

    stats = await conn.fetchrow(
        """
        SELECT day_streak, longest_streak, xp_total, xp_level,
               lessons_completed, vocab_mastered, sakura_coins, last_activity_date
        FROM user_stats WHERE user_id = $1
        """,
        user_id,
    )

    def _fmt(v):
        """Convert asyncpg types to JSON-safe primitives."""
        if isinstance(v, datetime):
            return v.isoformat()
        return v

    def _row(r):
        return {k: _fmt(r[k]) for k in r.keys()}

    return {
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "schema_version": "1.0",
        "account": _row(profile),
        "stats": _row(stats) if stats else {},
        "active_sessions": [_row(s) for s in sessions],
        "srs_progress": [_row(p) for p in srs_progress],
        "lessons_completed": [_row(lp) for lp in lesson_progress],
        "mock_test_results": [_row(mr) for mr in mock_results],
    }


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
