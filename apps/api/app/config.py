"""Application configuration via pydantic-settings (reads .env)."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Database ──────────────────────────────────────────────
    database_url: str = "postgresql+asyncpg://manabogo:manabogo_dev@localhost/manabogo"
    redis_url: str = "redis://localhost:6379/0"

    # ── Auth ──────────────────────────────────────────────────
    jwt_secret_key: str = "change-me-in-production-minimum-32-characters"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 30

    # ── Email ─────────────────────────────────────────────────
    sendgrid_api_key: str = ""
    email_from: str = "noreply@manabogo.app"
    email_from_name: str = "ManaboGo"

    # ── AWS ───────────────────────────────────────────────────
    aws_region: str = "ap-southeast-1"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    ecs_cluster: str = "manabogo-cluster"
    ecs_service_api: str = "manabogo-api"

    # ── Cloudflare R2 ─────────────────────────────────────────
    r2_account_id: str = ""
    r2_access_key_id: str = ""
    r2_secret_access_key: str = ""
    r2_bucket_name: str = "manabogo-assets"
    r2_public_url: str = "https://assets.manabogo.app"

    # ── App ───────────────────────────────────────────────────
    app_env: str = "development"
    app_url: str = "http://localhost:3000"
    api_url: str = "http://localhost:8000"

    # ── Optional: disposable email denylist ───────────────────
    denylist_path: str = ""

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def is_testing(self) -> bool:
        return self.app_env == "testing"


settings = Settings()
