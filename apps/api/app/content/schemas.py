"""Pydantic schemas for content endpoints."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


# ── Vocabulary ────────────────────────────────────────────────

class VocabItem(BaseModel):
    id: UUID
    kanji: str
    reading: str
    meaning: str
    meaning_alts: list[str]
    part_of_speech: str
    jlpt_level: int
    tags: list[str]
    audio_url: str | None
    example_jp: str | None
    example_en: str | None
    sort_order: int


# ── SRS / Progress ────────────────────────────────────────────

class SrsGrade(BaseModel):
    """0=Again 1=Hard 2=Good 3=Easy (maps to SM-2 response quality 1/2/4/5)."""
    grade: int = Field(ge=0, le=3)


class ProgressItem(BaseModel):
    vocab_id: UUID
    srs_level: int
    ease_factor: float
    interval_days: float
    next_review_at: datetime
    last_reviewed: datetime | None
    review_count: int
    correct_count: int


class ReviewCard(BaseModel):
    """A vocab card ready for review, with its current SRS state."""
    vocab: VocabItem
    progress: ProgressItem | None  # None = first time seeing this card


class ReviewQueueResponse(BaseModel):
    cards: list[ReviewCard]
    total_due: int


class GradeResponse(BaseModel):
    vocab_id: UUID
    new_srs_level: int
    next_review_at: datetime
    xp_earned: int


# ── Lessons ───────────────────────────────────────────────────

class LessonBrief(BaseModel):
    id: UUID
    title: str
    title_ja: str | None
    type: str
    description: str
    sort_order: int
    is_free: bool
    completed: bool  # whether the current user completed it


class LessonDetail(LessonBrief):
    content_json: dict
    vocab_ids: list[UUID]


# ── Mock Tests ────────────────────────────────────────────────

class MockTestBrief(BaseModel):
    id: UUID
    title: str
    description: str
    time_limit_minutes: int
    is_active: bool


class MockResultResponse(BaseModel):
    id: UUID
    test_id: UUID
    score: int
    max_score: int
    passed: bool
    section_scores: dict
    time_taken_secs: int | None
    completed_at: datetime


# ── User Stats ────────────────────────────────────────────────

class UserStatsResponse(BaseModel):
    day_streak: int
    longest_streak: int
    sakura_coins: int
    xp_total: int
    xp_level: int
    lessons_completed: int
    vocab_mastered: int
    last_activity_date: str | None
