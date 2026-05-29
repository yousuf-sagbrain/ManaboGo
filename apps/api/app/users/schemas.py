"""Pydantic v2 models for /users/me endpoints."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    id: UUID
    email: str
    full_name: str | None
    avatar_url: str | None
    role: str
    email_verified: bool
    two_factor_enabled: bool
    is_active: bool
    created_at: datetime


class UpdateProfileRequest(BaseModel):
    full_name: str | None = Field(default=None, max_length=120)
    avatar_url: str | None = Field(default=None, max_length=512)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=10, max_length=128)


class SessionInfo(BaseModel):
    id: UUID
    user_agent: str | None
    ip_address: str | None
    last_seen: datetime
    created_at: datetime


class GdprExportResponse(BaseModel):
    exported_at: str
    schema_version: str
    account: dict
    stats: dict
    active_sessions: list[dict]
    srs_progress: list[dict]
    lessons_completed: list[dict]
    mock_test_results: list[dict]


class AvatarUploadResponse(BaseModel):
    avatar_url: str


class DeleteAccountResponse(BaseModel):
    message: str = "Account scheduled for deletion. You have 30 days to cancel by logging in."
