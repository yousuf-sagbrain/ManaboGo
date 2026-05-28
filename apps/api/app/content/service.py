"""Business logic for content — SRS scheduling, progress, stats."""

from __future__ import annotations

import math
from datetime import datetime, timedelta, timezone
from uuid import UUID

import asyncpg

# SM-2 quality values for the 4 UI grades: Again / Hard / Good / Easy
_GRADE_QUALITY = {0: 1, 1: 2, 2: 4, 3: 5}

# XP awarded per grade
_GRADE_XP = {0: 0, 1: 5, 2: 10, 3: 15}


def _sm2(
    ease: float,
    interval: float,
    srs_level: int,
    quality: int,
) -> tuple[float, float, int]:
    """Return (new_ease, new_interval_days, new_srs_level)."""
    if quality < 3:
        # Wrong / very hard → reset interval, keep ease
        new_interval = 1.0 if quality == 2 else 0.0
        new_level = max(0, srs_level - 1)
        new_ease = ease
    else:
        # Correct
        if srs_level == 0:
            new_interval = 1.0
        elif srs_level == 1:
            new_interval = 6.0
        else:
            new_interval = round(interval * ease, 1)
        new_ease = max(1.3, ease + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        new_level = min(8, srs_level + 1)

    return new_ease, new_interval, new_level


async def get_review_queue(
    conn: asyncpg.Connection,
    user_id: UUID,
    limit: int = 20,
) -> tuple[list[dict], int]:
    """Return (cards, total_due). Cards are due-now vocab + their progress."""
    now = datetime.now(timezone.utc)

    # Count total due
    total_due: int = await conn.fetchval(
        """
        SELECT COUNT(*)
        FROM user_progress
        WHERE user_id = $1 AND next_review_at <= $2
        """,
        user_id, now,
    )

    rows = await conn.fetch(
        """
        SELECT
            v.id, v.kanji, v.reading, v.meaning, v.meaning_alts,
            v.part_of_speech, v.jlpt_level, v.tags,
            v.audio_url, v.example_jp, v.example_en, v.sort_order,
            p.srs_level, p.ease_factor, p.interval_days,
            p.next_review_at, p.last_reviewed,
            p.review_count, p.correct_count
        FROM user_progress p
        JOIN vocabulary v ON v.id = p.vocab_id
        WHERE p.user_id = $1 AND p.next_review_at <= $2
        ORDER BY p.next_review_at ASC
        LIMIT $3
        """,
        user_id, now, limit,
    )
    return [dict(r) for r in rows], total_due or 0


async def get_new_cards(
    conn: asyncpg.Connection,
    user_id: UUID,
    limit: int = 10,
) -> list[dict]:
    """Return vocab the user has never seen (no progress row)."""
    rows = await conn.fetch(
        """
        SELECT
            v.id, v.kanji, v.reading, v.meaning, v.meaning_alts,
            v.part_of_speech, v.jlpt_level, v.tags,
            v.audio_url, v.example_jp, v.example_en, v.sort_order
        FROM vocabulary v
        WHERE v.jlpt_level = 5
          AND NOT EXISTS (
              SELECT 1 FROM user_progress p
              WHERE p.user_id = $1 AND p.vocab_id = v.id
          )
        ORDER BY v.sort_order ASC
        LIMIT $2
        """,
        user_id, limit,
    )
    return [dict(r) for r in rows]


async def grade_card(
    conn: asyncpg.Connection,
    user_id: UUID,
    vocab_id: UUID,
    grade: int,
) -> dict:
    """Apply SM-2 scheduling. Creates progress row if first review. Returns updated state."""
    now = datetime.now(timezone.utc)
    quality = _GRADE_QUALITY[grade]
    xp = _GRADE_XP[grade]

    existing = await conn.fetchrow(
        "SELECT * FROM user_progress WHERE user_id=$1 AND vocab_id=$2",
        user_id, vocab_id,
    )

    if existing is None:
        ease, interval, level = 2.5, 0.0, 0
    else:
        ease = existing["ease_factor"]
        interval = existing["interval_days"]
        level = existing["srs_level"]

    new_ease, new_interval, new_level = _sm2(ease, interval, level, quality)

    if new_interval < 1:
        # "Again" — review again in 1 minute
        next_review = now + timedelta(minutes=1)
    else:
        next_review = now + timedelta(days=new_interval)

    if existing is None:
        await conn.execute(
            """
            INSERT INTO user_progress
                (user_id, vocab_id, srs_level, ease_factor, interval_days,
                 next_review_at, last_reviewed, review_count, correct_count)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 1, $8)
            """,
            user_id, vocab_id, new_level, new_ease, new_interval,
            next_review, now, 1 if quality >= 3 else 0,
        )
    else:
        await conn.execute(
            """
            UPDATE user_progress SET
                srs_level      = $3,
                ease_factor    = $4,
                interval_days  = $5,
                next_review_at = $6,
                last_reviewed  = $7,
                review_count   = review_count + 1,
                correct_count  = correct_count + $8,
                updated_at     = now()
            WHERE user_id=$1 AND vocab_id=$2
            """,
            user_id, vocab_id, new_level, new_ease, new_interval,
            next_review, now, 1 if quality >= 3 else 0,
        )

    # Award XP (upsert user_stats)
    if xp > 0:
        await conn.execute(
            """
            INSERT INTO user_stats (user_id, xp_total)
            VALUES ($1, $2)
            ON CONFLICT (user_id) DO UPDATE
                SET xp_total   = user_stats.xp_total + $2,
                    xp_level   = GREATEST(1, (user_stats.xp_total + $2) / 500 + 1),
                    updated_at = now()
            """,
            user_id, xp,
        )

    return {
        "vocab_id": vocab_id,
        "new_srs_level": new_level,
        "next_review_at": next_review,
        "xp_earned": xp,
    }


async def get_user_stats(conn: asyncpg.Connection, user_id: UUID) -> dict | None:
    row = await conn.fetchrow(
        "SELECT * FROM user_stats WHERE user_id = $1", user_id
    )
    return dict(row) if row else None


async def ensure_user_stats(conn: asyncpg.Connection, user_id: UUID) -> dict:
    """Get or create user_stats row."""
    stats = await get_user_stats(conn, user_id)
    if stats is None:
        await conn.execute(
            "INSERT INTO user_stats (user_id) VALUES ($1) ON CONFLICT DO NOTHING",
            user_id,
        )
        stats = await get_user_stats(conn, user_id)
    return stats  # type: ignore[return-value]
