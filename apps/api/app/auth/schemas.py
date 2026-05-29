"""Pydantic v2 request/response models for auth endpoints."""

from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator


# ── Registration ──────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=10, max_length=128)
    full_name: str | None = Field(default=None, max_length=120)


class RegisterResponse(BaseModel):
    user_id: UUID
    email: str
    message: str


# ── Login ──────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    totp_code: str | None = Field(default=None, pattern=r"^\d{6}$|^[A-F0-9]{8}$")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserBrief


class UserBrief(BaseModel):
    id: UUID
    email: str
    role: str
    full_name: str | None = None
    email_verified: bool = False


class Requires2FAResponse(BaseModel):
    requires_2fa: bool = True
    message: str = "Two-factor authentication code required."


class Requires2FASetupResponse(BaseModel):
    requires_2fa_setup: bool = True
    message: str = "Two-factor authentication setup required for your role."


# ── Email Verification ────────────────────────────────────────

class VerifyEmailResponse(BaseModel):
    message: str


# ── Password Reset ────────────────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str = "If an account with that email exists, a reset link has been sent."


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=10, max_length=128)


class ResetPasswordResponse(BaseModel):
    message: str = "Password updated. Please log in."


# ── Logout ────────────────────────────────────────────────────

class LogoutResponse(BaseModel):
    message: str = "Logged out."


# ── Token Refresh ─────────────────────────────────────────────

class RefreshResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── 2FA Setup ─────────────────────────────────────────────────

class TwoFactorSetupResponse(BaseModel):
    secret: str
    otpauth_url: str
    qr_code_base64: str


class TwoFactorConfirmRequest(BaseModel):
    totp_code: str = Field(pattern=r"^\d{6}$")


class TwoFactorConfirmResponse(BaseModel):
    message: str = "Two-factor authentication enabled."
    backup_codes: list[str]


class TwoFactorDisableRequest(BaseModel):
    current_password: str
    totp_code: str = Field(pattern=r"^\d{6}$")


class TwoFactorDisableResponse(BaseModel):
    message: str = "Two-factor authentication disabled."


# ── OAuth Stubs ───────────────────────────────────────────────

class OAuthNotImplementedResponse(BaseModel):
    detail: str = "Social login not yet implemented."
    provider: str


# ── Resend Verification ───────────────────────────────────────

class ResendVerificationRequest(BaseModel):
    email: EmailStr


class ResendVerificationResponse(BaseModel):
    message: str = "If your email is unverified, a new link has been sent."


# ── Generic ───────────────────────────────────────────────────

class MessageResponse(BaseModel):
    message: str
