"""Content schema — vocabulary, lessons, progress, mock tests.

Revision ID: 0002
Revises: 0001
Create Date: 2026-05-28
"""

from alembic import op

revision: str = "0002"
down_revision: str = "0001"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    # ── vocabulary ────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE vocabulary (
            id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            kanji           TEXT NOT NULL,
            reading         TEXT NOT NULL,
            meaning         TEXT NOT NULL,
            meaning_alts    TEXT[] NOT NULL DEFAULT '{}',
            part_of_speech  TEXT NOT NULL DEFAULT 'noun'
                                CHECK (part_of_speech IN (
                                    'noun','verb_u','verb_ru','verb_irr',
                                    'i_adj','na_adj','adverb','particle',
                                    'conjunction','counter','expression','prefix','suffix'
                                )),
            jlpt_level      SMALLINT NOT NULL DEFAULT 5
                                CHECK (jlpt_level BETWEEN 1 AND 5),
            tags            TEXT[] NOT NULL DEFAULT '{}',
            audio_url       TEXT,
            example_jp      TEXT,
            example_en      TEXT,
            sort_order      INTEGER NOT NULL DEFAULT 0,
            created_at      TIMESTAMPTZ DEFAULT now()
        )
    """)
    op.execute("CREATE INDEX idx_vocab_jlpt ON vocabulary(jlpt_level)")
    op.execute("CREATE INDEX idx_vocab_sort  ON vocabulary(sort_order)")

    # ── lessons ───────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE lessons (
            id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title           TEXT NOT NULL,
            title_ja        TEXT,
            type            TEXT NOT NULL DEFAULT 'vocabulary'
                                CHECK (type IN ('vocabulary','grammar','kanji','listening')),
            description     TEXT NOT NULL DEFAULT '',
            content_json    JSONB NOT NULL DEFAULT '{}',
            vocab_ids       UUID[] NOT NULL DEFAULT '{}',
            sort_order      INTEGER NOT NULL DEFAULT 0,
            is_free         BOOLEAN NOT NULL DEFAULT TRUE,
            created_at      TIMESTAMPTZ DEFAULT now()
        )
    """)
    op.execute("CREATE INDEX idx_lessons_sort ON lessons(sort_order)")
    op.execute("CREATE INDEX idx_lessons_type ON lessons(type)")

    # ── user_progress (SRS state per vocab per user) ───────────────
    op.execute("""
        CREATE TABLE user_progress (
            id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            vocab_id        UUID NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
            srs_level       SMALLINT NOT NULL DEFAULT 0
                                CHECK (srs_level BETWEEN 0 AND 8),
            ease_factor     REAL NOT NULL DEFAULT 2.5,
            interval_days   REAL NOT NULL DEFAULT 0,
            next_review_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
            last_reviewed   TIMESTAMPTZ,
            review_count    INTEGER NOT NULL DEFAULT 0,
            correct_count   INTEGER NOT NULL DEFAULT 0,
            created_at      TIMESTAMPTZ DEFAULT now(),
            updated_at      TIMESTAMPTZ DEFAULT now(),
            UNIQUE (user_id, vocab_id)
        )
    """)
    op.execute("CREATE INDEX idx_progress_user_id        ON user_progress(user_id)")
    op.execute("CREATE INDEX idx_progress_next_review    ON user_progress(user_id, next_review_at)")
    op.execute("CREATE INDEX idx_progress_srs_level      ON user_progress(user_id, srs_level)")

    # ── lesson_progress ───────────────────────────────────────────
    op.execute("""
        CREATE TABLE lesson_progress (
            id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            lesson_id       UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
            completed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
            score_pct       SMALLINT CHECK (score_pct BETWEEN 0 AND 100),
            UNIQUE (user_id, lesson_id)
        )
    """)
    op.execute("CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id)")

    # ── mock_tests ────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE mock_tests (
            id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title               TEXT NOT NULL,
            description         TEXT NOT NULL DEFAULT '',
            time_limit_minutes  SMALLINT NOT NULL DEFAULT 105,
            sections            JSONB NOT NULL DEFAULT '[]',
            is_active           BOOLEAN NOT NULL DEFAULT TRUE,
            created_at          TIMESTAMPTZ DEFAULT now()
        )
    """)

    # ── mock_results ──────────────────────────────────────────────
    op.execute("""
        CREATE TABLE mock_results (
            id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            test_id         UUID NOT NULL REFERENCES mock_tests(id) ON DELETE CASCADE,
            score           SMALLINT NOT NULL,
            max_score       SMALLINT NOT NULL,
            passed          BOOLEAN NOT NULL DEFAULT FALSE,
            section_scores  JSONB NOT NULL DEFAULT '{}',
            answers_json    JSONB NOT NULL DEFAULT '{}',
            time_taken_secs INTEGER,
            completed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """)
    op.execute("CREATE INDEX idx_mock_results_user   ON mock_results(user_id)")
    op.execute("CREATE INDEX idx_mock_results_test   ON mock_results(test_id)")
    op.execute("CREATE INDEX idx_mock_results_date   ON mock_results(user_id, completed_at DESC)")

    # ── user_stats (denorm counters for dashboard) ─────────────────
    op.execute("""
        CREATE TABLE user_stats (
            user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            day_streak          INTEGER NOT NULL DEFAULT 0,
            longest_streak      INTEGER NOT NULL DEFAULT 0,
            last_activity_date  DATE,
            sakura_coins        INTEGER NOT NULL DEFAULT 0,
            xp_total            INTEGER NOT NULL DEFAULT 0,
            xp_level            SMALLINT NOT NULL DEFAULT 1,
            lessons_completed   INTEGER NOT NULL DEFAULT 0,
            vocab_mastered       INTEGER NOT NULL DEFAULT 0,
            updated_at          TIMESTAMPTZ DEFAULT now()
        )
    """)


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS user_stats")
    op.execute("DROP TABLE IF EXISTS mock_results")
    op.execute("DROP TABLE IF EXISTS mock_tests")
    op.execute("DROP TABLE IF EXISTS lesson_progress")
    op.execute("DROP TABLE IF EXISTS user_progress")
    op.execute("DROP TABLE IF EXISTS lessons")
    op.execute("DROP TABLE IF EXISTS vocabulary")
