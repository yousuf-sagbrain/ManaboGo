"""Initial schema — users, auth tokens, sessions, OAuth identities.

Revision ID: 0001
Revises:
Create Date: 2026-05-27
"""

from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    # Enable pgcrypto for gen_random_uuid()
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")

    # ── users ─────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE users (
            id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email               TEXT UNIQUE NOT NULL,
            password_hash       TEXT,
            email_verified      BOOLEAN NOT NULL DEFAULT FALSE,
            role                TEXT NOT NULL DEFAULT 'user'
                                    CHECK (role IN ('user','pro_user','admin','super_admin')),
            two_factor_secret   TEXT,
            full_name           TEXT,
            avatar_url          TEXT,
            is_active           BOOLEAN NOT NULL DEFAULT TRUE,
            deleted_at          TIMESTAMPTZ,
            created_at          TIMESTAMPTZ DEFAULT now(),
            updated_at          TIMESTAMPTZ DEFAULT now()
        )
    """)

    # ── email_verification_tokens ─────────────────────────────
    op.execute("""
        CREATE TABLE email_verification_tokens (
            id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token       TEXT UNIQUE NOT NULL,
            expires_at  TIMESTAMPTZ NOT NULL,
            used_at     TIMESTAMPTZ,
            created_at  TIMESTAMPTZ DEFAULT now()
        )
    """)

    # ── password_reset_tokens ─────────────────────────────────
    op.execute("""
        CREATE TABLE password_reset_tokens (
            id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token_hash  TEXT UNIQUE NOT NULL,
            expires_at  TIMESTAMPTZ NOT NULL,
            used_at     TIMESTAMPTZ,
            created_at  TIMESTAMPTZ DEFAULT now()
        )
    """)

    # ── refresh_tokens ────────────────────────────────────────
    op.execute("""
        CREATE TABLE refresh_tokens (
            id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            family_id   UUID NOT NULL,
            token_hash  TEXT UNIQUE NOT NULL,
            expires_at  TIMESTAMPTZ NOT NULL,
            revoked_at  TIMESTAMPTZ,
            created_at  TIMESTAMPTZ DEFAULT now()
        )
    """)

    # ── oauth_identities ──────────────────────────────────────
    op.execute("""
        CREATE TABLE oauth_identities (
            id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            provider         TEXT NOT NULL CHECK (provider IN ('google','apple','line')),
            provider_user_id TEXT NOT NULL,
            created_at       TIMESTAMPTZ DEFAULT now(),
            UNIQUE (provider, provider_user_id)
        )
    """)

    # ── user_sessions ─────────────────────────────────────────
    op.execute("""
        CREATE TABLE user_sessions (
            id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            refresh_token_id UUID REFERENCES refresh_tokens(id) ON DELETE CASCADE,
            user_agent       TEXT,
            ip_address       INET,
            last_seen        TIMESTAMPTZ DEFAULT now(),
            created_at       TIMESTAMPTZ DEFAULT now()
        )
    """)

    # ── Indexes ───────────────────────────────────────────────
    op.execute("CREATE INDEX idx_users_email ON users(email)")
    op.execute("CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id)")
    op.execute("CREATE INDEX idx_refresh_tokens_family_id ON refresh_tokens(family_id)")
    op.execute("CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id)")

    # ── 2FA backup codes table ────────────────────────────────
    op.execute("""
        CREATE TABLE two_factor_backup_codes (
            id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            code_hash   TEXT NOT NULL,
            used_at     TIMESTAMPTZ,
            created_at  TIMESTAMPTZ DEFAULT now()
        )
    """)
    op.execute("CREATE INDEX idx_2fa_backup_user_id ON two_factor_backup_codes(user_id)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS two_factor_backup_codes")
    op.execute("DROP TABLE IF EXISTS user_sessions")
    op.execute("DROP TABLE IF EXISTS oauth_identities")
    op.execute("DROP TABLE IF EXISTS refresh_tokens")
    op.execute("DROP TABLE IF EXISTS password_reset_tokens")
    op.execute("DROP TABLE IF EXISTS email_verification_tokens")
    op.execute("DROP TABLE IF EXISTS users")
