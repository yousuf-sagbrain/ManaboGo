"""Content endpoints — vocabulary, SRS reviews, lessons, stats."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.auth.dependencies import CurrentUser, require_permission
from app.auth.permissions import PermissionKey
from app.content import schemas, service
from app.database import get_db_conn

router = APIRouter(prefix="/content", tags=["content"])


# ── GET /content/vocab ────────────────────────────────────────

@router.get("/vocab", response_model=list[schemas.VocabItem])
async def list_vocabulary(
    jlpt_level: int = Query(5, ge=1, le=5),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    conn=Depends(get_db_conn),
    _: CurrentUser = Depends(require_permission(PermissionKey.PRACTICE_BASIC)),
):
    rows = await conn.fetch(
        """
        SELECT id, kanji, reading, meaning, meaning_alts, part_of_speech,
               jlpt_level, tags, audio_url, example_jp, example_en, sort_order
        FROM vocabulary
        WHERE jlpt_level = $1
        ORDER BY sort_order ASC
        LIMIT $2 OFFSET $3
        """,
        jlpt_level, limit, offset,
    )
    return [dict(r) for r in rows]


# ── GET /content/review-queue ─────────────────────────────────

@router.get("/review-queue", response_model=schemas.ReviewQueueResponse)
async def get_review_queue(
    limit: int = Query(20, ge=1, le=50),
    include_new: bool = Query(True),
    conn=Depends(get_db_conn),
    current_user: CurrentUser = Depends(require_permission(PermissionKey.PRACTICE_BASIC)),
):
    user_id = UUID(current_user.id)

    due_rows, total_due = await service.get_review_queue(conn, user_id, limit)

    cards: list[dict] = []
    for row in due_rows:
        vocab = {k: row[k] for k in [
            "id", "kanji", "reading", "meaning", "meaning_alts",
            "part_of_speech", "jlpt_level", "tags", "audio_url",
            "example_jp", "example_en", "sort_order",
        ]}
        progress = {k: row[k] for k in [
            "srs_level", "ease_factor", "interval_days", "next_review_at",
            "last_reviewed", "review_count", "correct_count",
        ]}
        progress["vocab_id"] = row["id"]
        cards.append({"vocab": vocab, "progress": progress})

    # Pad with new cards if requested and there's room
    if include_new and len(cards) < limit:
        new_rows = await service.get_new_cards(conn, user_id, limit - len(cards))
        for row in new_rows:
            cards.append({"vocab": row, "progress": None})

    return {"cards": cards, "total_due": total_due}


# ── POST /content/grade ───────────────────────────────────────

@router.post("/grade", response_model=schemas.GradeResponse, status_code=status.HTTP_200_OK)
async def grade_card(
    body: schemas.SrsGrade,
    vocab_id: UUID = Query(...),
    conn=Depends(get_db_conn),
    current_user: CurrentUser = Depends(require_permission(PermissionKey.PRACTICE_BASIC)),
):
    result = await service.grade_card(conn, UUID(current_user.id), vocab_id, body.grade)
    return result


# ── GET /content/lessons ──────────────────────────────────────

@router.get("/lessons", response_model=list[schemas.LessonBrief])
async def list_lessons(
    conn=Depends(get_db_conn),
    current_user: CurrentUser = Depends(require_permission(PermissionKey.PRACTICE_BASIC)),
):
    user_id = UUID(current_user.id)
    rows = await conn.fetch(
        """
        SELECT
            l.id, l.title, l.title_ja, l.type, l.description,
            l.sort_order, l.is_free,
            (lp.id IS NOT NULL) AS completed
        FROM lessons l
        LEFT JOIN lesson_progress lp
            ON lp.lesson_id = l.id AND lp.user_id = $1
        ORDER BY l.sort_order ASC
        """,
        user_id,
    )
    return [dict(r) for r in rows]


# ── GET /content/lessons/{lesson_id} ─────────────────────────

@router.get("/lessons/{lesson_id}", response_model=schemas.LessonDetail)
async def get_lesson(
    lesson_id: UUID,
    conn=Depends(get_db_conn),
    current_user: CurrentUser = Depends(require_permission(PermissionKey.PRACTICE_BASIC)),
):
    user_id = UUID(current_user.id)
    row = await conn.fetchrow(
        """
        SELECT
            l.id, l.title, l.title_ja, l.type, l.description,
            l.sort_order, l.is_free, l.content_json, l.vocab_ids,
            (lp.id IS NOT NULL) AS completed
        FROM lessons l
        LEFT JOIN lesson_progress lp
            ON lp.lesson_id = l.id AND lp.user_id = $1
        WHERE l.id = $2
        """,
        user_id, lesson_id,
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Lesson not found.")
    return dict(row)


# ── POST /content/lessons/{lesson_id}/complete ────────────────

@router.post("/lessons/{lesson_id}/complete", status_code=status.HTTP_204_NO_CONTENT)
async def complete_lesson(
    lesson_id: UUID,
    score_pct: int = Query(100, ge=0, le=100),
    conn=Depends(get_db_conn),
    current_user: CurrentUser = Depends(require_permission(PermissionKey.PRACTICE_BASIC)),
):
    user_id = UUID(current_user.id)
    await conn.execute(
        """
        INSERT INTO lesson_progress (user_id, lesson_id, score_pct)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, lesson_id) DO UPDATE
            SET completed_at = now(), score_pct = $3
        """,
        user_id, lesson_id, score_pct,
    )
    # Increment lessons_completed counter
    await conn.execute(
        """
        INSERT INTO user_stats (user_id, lessons_completed)
        VALUES ($1, 1)
        ON CONFLICT (user_id) DO UPDATE
            SET lessons_completed = user_stats.lessons_completed + 1,
                updated_at        = now()
        """,
        user_id,
    )


# ── GET /content/stats ────────────────────────────────────────

@router.get("/stats", response_model=schemas.UserStatsResponse)
async def get_stats(
    conn=Depends(get_db_conn),
    current_user: CurrentUser = Depends(require_permission(PermissionKey.PRACTICE_BASIC)),
):
    user_id = UUID(current_user.id)
    stats = await service.ensure_user_stats(conn, user_id)
    last_activity = stats.get("last_activity_date")
    return {
        **stats,
        "last_activity_date": last_activity.isoformat() if last_activity else None,
    }


# ── GET /content/mock-tests ───────────────────────────────────

@router.get("/mock-tests", response_model=list[schemas.MockTestBrief])
async def list_mock_tests(
    conn=Depends(get_db_conn),
    _: CurrentUser = Depends(require_permission(PermissionKey.MOCK_LIMITED)),
):
    rows = await conn.fetch(
        "SELECT id, title, description, time_limit_minutes, is_active FROM mock_tests WHERE is_active ORDER BY created_at"
    )
    return [dict(r) for r in rows]
