from datetime import date, timedelta

import asyncpg


def _sm2(
    ease_factor: float,
    interval_days: int,
    repetitions: int,
    quality: int,
) -> tuple[float, int, int, date]:
    """
    SM-2 algorithm.
    quality 0–5: 0–2 = failed recall, 3–5 = successful recall.
    Returns (new_ease_factor, new_interval_days, new_repetitions, next_review_date).
    """
    if quality >= 3:
        if repetitions == 0:
            new_interval = 1
        elif repetitions == 1:
            new_interval = 6
        else:
            new_interval = round(interval_days * ease_factor)
        new_repetitions = repetitions + 1
    else:
        new_interval = 1
        new_repetitions = 0

    new_ef = ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    new_ef = max(1.3, round(new_ef, 4))
    return new_ef, new_interval, new_repetitions, date.today() + timedelta(days=new_interval)


def quality_from_answer(is_correct: bool, response_ms: int | None) -> int:
    """Map binary correctness + response time to SM-2 quality 0–5."""
    if not is_correct:
        return 0
    if response_ms is None or response_ms > 6000:
        return 3   # correct but slow
    if response_ms > 3000:
        return 4   # correct with some hesitation
    return 5       # fast and correct


async def get_due_queue(
    pool: asyncpg.Pool,
    user_id: str,
    script_filter: str,
) -> list[dict]:
    """
    Ensure srs_schedule rows exist for every kana in the filter, then return
    all characters whose next_review_date is today or earlier, ordered by:
      1. next_review_date ASC  (most overdue first)
      2. ease_factor ASC       (hardest chars first within same date)
      3. row/col order         (natural kana ordering as tiebreak)
    """
    if script_filter == 'both':
        await pool.execute(
            """
            INSERT INTO kana_srs_schedule (user_id, kana_id)
            SELECT $1, MIN(id)
            FROM kana_characters
            GROUP BY character
            ON CONFLICT DO NOTHING
            """,
            user_id,
        )
        rows = await pool.fetch(
            """
            SELECT DISTINCT ON (kc.character)
                   kc.id, kc.character, kc.romaji, kc.aliases, kc.audio_url,
                   kc.script_type, kc.row_order, kc.col_order
            FROM kana_characters kc
            JOIN kana_srs_schedule s ON s.kana_id = kc.id AND s.user_id = $1
            WHERE s.next_review_date <= CURRENT_DATE
            ORDER BY kc.character,
                     s.next_review_date ASC,
                     s.ease_factor ASC,
                     kc.row_order ASC NULLS LAST,
                     kc.col_order ASC NULLS LAST
            """,
            user_id,
        )
    else:
        await pool.execute(
            """
            INSERT INTO kana_srs_schedule (user_id, kana_id)
            SELECT $1, MIN(id)
            FROM kana_characters
            WHERE script_type = $2
            GROUP BY character
            ON CONFLICT DO NOTHING
            """,
            user_id,
            script_filter,
        )
        rows = await pool.fetch(
            """
            SELECT DISTINCT ON (kc.character)
                   kc.id, kc.character, kc.romaji, kc.aliases, kc.audio_url,
                   kc.script_type, kc.row_order, kc.col_order
            FROM kana_characters kc
            JOIN kana_srs_schedule s ON s.kana_id = kc.id AND s.user_id = $1
            WHERE kc.script_type = $2
              AND s.next_review_date <= CURRENT_DATE
            ORDER BY kc.character,
                     s.next_review_date ASC,
                     s.ease_factor ASC,
                     kc.row_order ASC NULLS LAST,
                     kc.col_order ASC NULLS LAST
            """,
            user_id,
            script_filter,
        )

    return [dict(r) for r in rows]


async def record_review(
    pool: asyncpg.Pool,
    user_id: str,
    kana_id: str,
    quality: int,
) -> None:
    """Apply SM-2 update for a single answer."""
    row = await pool.fetchrow(
        """
        SELECT ease_factor, interval_days, repetitions
        FROM kana_srs_schedule
        WHERE user_id = $1 AND kana_id = $2
        """,
        user_id,
        kana_id,
    )

    if not row:
        ef, interval, reps = 2.5, 0, 0
    else:
        ef       = float(row['ease_factor'])
        interval = int(row['interval_days'])
        reps     = int(row['repetitions'])

    new_ef, new_interval, new_reps, next_date = _sm2(ef, interval, reps, quality)

    await pool.execute(
        """
        INSERT INTO kana_srs_schedule
            (user_id, kana_id, ease_factor, interval_days, repetitions, next_review_date, last_reviewed_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (user_id, kana_id) DO UPDATE SET
            ease_factor      = $3,
            interval_days    = $4,
            repetitions      = $5,
            next_review_date = $6,
            last_reviewed_at = NOW()
        """,
        user_id,
        kana_id,
        new_ef,
        new_interval,
        new_reps,
        next_date,
    )
