"""Kana characters and SRS schedule tables for Phase 1 kana mastery.

Revision ID: 0003
Revises: 0002
Create Date: 2026-06-01
"""

from alembic import op

revision: str = "0003"
down_revision: str = "0002"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    # ── kana_characters ───────────────────────────────────────────────
    op.execute("""
        CREATE TYPE kana_script_type AS ENUM ('hiragana', 'katakana');
    """)

    op.execute("""
        CREATE TABLE kana_characters (
            id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            character   VARCHAR(5)  NOT NULL,
            romaji      VARCHAR(10) NOT NULL,
            aliases     VARCHAR[]   NOT NULL DEFAULT '{}',
            script_type kana_script_type NOT NULL,
            vowel_group VARCHAR(5),
            row_order   INTEGER,
            col_order   INTEGER,
            audio_url   VARCHAR(500),
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE (character, script_type)
        );
    """)

    op.execute("""
        CREATE INDEX kana_script_type_idx  ON kana_characters (script_type);
        CREATE INDEX kana_vowel_group_idx  ON kana_characters (vowel_group);
        CREATE INDEX kana_row_col_idx      ON kana_characters (row_order, col_order);
    """)

    # ── kana_srs_schedule ─────────────────────────────────────────────
    op.execute("""
        CREATE TABLE kana_srs_schedule (
            user_id          UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            kana_id          UUID    NOT NULL REFERENCES kana_characters(id) ON DELETE CASCADE,
            ease_factor      NUMERIC(4,2) NOT NULL DEFAULT 2.50,
            interval_days    INTEGER      NOT NULL DEFAULT 0,
            repetitions      INTEGER      NOT NULL DEFAULT 0,
            next_review_date DATE         NOT NULL DEFAULT CURRENT_DATE,
            last_reviewed_at TIMESTAMPTZ,
            PRIMARY KEY (user_id, kana_id)
        );
    """)

    op.execute("""
        CREATE INDEX kana_srs_user_due_idx
            ON kana_srs_schedule (user_id, next_review_date);
    """)


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS kana_srs_schedule;")
    op.execute("DROP TABLE IF EXISTS kana_characters;")
    op.execute("DROP TYPE  IF EXISTS kana_script_type;")
