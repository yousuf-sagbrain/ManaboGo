"""All auth business logic — registration, login, tokens, 2FA, password reset."""

from __future__ import annotations

import logging
import secrets
from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid4

import asyncpg

from app.auth.permissions import get_permissions_for_role
from app.auth.utils import (
    create_access_token,
    create_refresh_token,
    generate_backup_codes,
    generate_qr_code_base64,
    generate_totp_secret,
    get_totp_uri,
    hash_password,
    hash_token,
    is_disposable_email,
    validate_password_strength,
    verify_password,
    verify_totp_code,
)
from app.config import settings

logger = logging.getLogger(__name__)

# ── Redis rate-limit key ──────────────────────────────────────
RATE_LIMIT_PREFIX = "login_fail:"
RATE_LIMIT_MAX = 5
RATE_LIMIT_WINDOW = 15 * 60  # 15 minutes in seconds

# ── Email sending ──────────────────────────────────────────────

async def send_email(to: str, subject: str, html: str) -> None:
    """Send email via SendGrid or log to console if API key not set."""
    if not settings.sendgrid_api_key:
        logger.info("[EMAIL STUB] To: %s | Subject: %s\n%s", to, subject, html)
        return
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail

        message = Mail(
            from_email=(settings.email_from, settings.email_from_name),
            to_emails=to,
            subject=subject,
            html_content=html,
        )
        sg = SendGridAPIClient(settings.sendgrid_api_key)
        sg.send(message)
    except Exception as e:
        logger.error("Failed to send email to %s: %s", to, e)


# ── Registration ──────────────────────────────────────────────

async def register_user(
    conn: asyncpg.Connection,
    email: str,
    password: str,
    full_name: str | None,
) -> dict:
    """Register a new user. Returns user dict on success."""
    # 1. Check disposable email
    if is_disposable_email(email):
        raise ValueError("disposable_email")

    # 2. Validate password strength
    valid, error_msg = validate_password_strength(password)
    if not valid:
        raise ValueError(f"weak_password:{error_msg}")

    # 3. Check for existing email
    existing = await conn.fetchrow("SELECT id FROM users WHERE email = $1", email.lower())
    if existing:
        raise ValueError("email_exists")

    # 4. Hash password + insert user
    pw_hash = hash_password(password)
    user = await conn.fetchrow(
        """
        INSERT INTO users (email, password_hash, full_name, role, email_verified)
        VALUES ($1, $2, $3, 'user', FALSE)
        RETURNING id, email, full_name, role
        """,
        email.lower(),
        pw_hash,
        full_name,
    )

    # 5. Create email verification token (24h expiry)
    token = secrets.token_urlsafe(48)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
    await conn.execute(
        """
        INSERT INTO email_verification_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
        """,
        user["id"],
        token,
        expires_at,
    )

    # 6. Send verification email
    verify_url = f"{settings.app_url}/verify-email?token={token}"
    await send_email(
        to=str(user["email"]),
        subject="Verify your ManaboGo email",
        html=f"""
        <h2>Welcome to ManaboGo!</h2>
        <p>Click the link below to verify your email address:</p>
        <p><a href="{verify_url}">Verify Email</a></p>
        <p>This link expires in 24 hours.</p>
        <p>If you did not sign up for ManaboGo, please ignore this email.</p>
        """,
    )

    return dict(user)


# ── Email Verification ────────────────────────────────────────

async def verify_email(conn: asyncpg.Connection, token: str) -> None:
    """Mark email as verified. Raises ValueError on invalid/expired token."""
    row = await conn.fetchrow(
        """
        SELECT id, user_id, expires_at, used_at
        FROM email_verification_tokens
        WHERE token = $1
        """,
        token,
    )
    if not row:
        raise ValueError("invalid_token")
    if row["used_at"] is not None:
        raise ValueError("already_used")
    if row["expires_at"] < datetime.now(timezone.utc):
        raise ValueError("expired_token")

    async with conn.transaction():
        await conn.execute(
            "UPDATE users SET email_verified = TRUE, updated_at = now() WHERE id = $1",
            row["user_id"],
        )
        await conn.execute(
            "UPDATE email_verification_tokens SET used_at = now() WHERE id = $1",
            row["id"],
        )


# ── Login ──────────────────────────────────────────────────────

async def login_user(
    conn: asyncpg.Connection,
    redis,
    email: str,
    password: str,
    totp_code: str | None,
    user_agent: str | None,
    ip_address: str | None,
) -> dict:
    """
    Authenticate user and issue tokens.
    Returns dict with access_token, refresh_token, user info,
    or special flags for 2FA requirements.
    """
    rate_key = f"{RATE_LIMIT_PREFIX}{email.lower()}"

    # Check rate limit
    fail_count = await redis.get(rate_key)
    if fail_count and int(fail_count) >= RATE_LIMIT_MAX:
        raise ValueError("rate_limited")

    # Fetch user
    user = await conn.fetchrow(
        """
        SELECT id, email, password_hash, role, two_factor_secret,
               email_verified, full_name, is_active, deleted_at
        FROM users WHERE email = $1
        """,
        email.lower(),
    )

    # Generic 401 — never distinguish email vs password
    async def _fail() -> None:
        pipe = redis.pipeline()
        await pipe.incr(rate_key)
        await pipe.expire(rate_key, RATE_LIMIT_WINDOW)
        await pipe.execute()
        raise ValueError("invalid_credentials")

    if not user:
        await _fail()
        return {}  # unreachable

    if not user["is_active"] or user["deleted_at"] is not None:
        await _fail()
        return {}

    if not user["password_hash"]:
        await _fail()
        return {}

    if not verify_password(password, user["password_hash"]):
        await _fail()
        return {}

    # Clear rate limit on success
    await redis.delete(rate_key)

    role = user["role"]

    # Admin/Super Admin: must have 2FA set up
    if role in ("admin", "super_admin") and not user["two_factor_secret"]:
        return {"requires_2fa_setup": True}

    # 2FA check
    if user["two_factor_secret"]:
        if not totp_code:
            return {"requires_2fa": True}
        # Allow backup codes (8 hex chars)
        if len(totp_code) == 8:
            valid_backup = await _check_backup_code(conn, user["id"], totp_code)
            if not valid_backup:
                raise ValueError("invalid_totp")
        elif not verify_totp_code(user["two_factor_secret"], totp_code):
            raise ValueError("invalid_totp")

    # Issue tokens
    permissions = get_permissions_for_role(role)
    access_token = create_access_token(
        user_id=str(user["id"]),
        email=user["email"],
        role=role,
        permissions=permissions,
    )
    refresh_token_value = create_refresh_token()
    refresh_token_hash = hash_token(refresh_token_value)
    family_id = uuid4()
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)

    async with conn.transaction():
        rt_row = await conn.fetchrow(
            """
            INSERT INTO refresh_tokens (user_id, family_id, token_hash, expires_at)
            VALUES ($1, $2, $3, $4)
            RETURNING id
            """,
            user["id"],
            family_id,
            refresh_token_hash,
            expires_at,
        )
        await conn.execute(
            """
            INSERT INTO user_sessions (user_id, refresh_token_id, user_agent, ip_address)
            VALUES ($1, $2, $3, $4::inet)
            """,
            user["id"],
            rt_row["id"],
            user_agent,
            ip_address,
        )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token_value,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "role": role,
            "full_name": user["full_name"],
            "email_verified": user["email_verified"],
        },
    }


async def _check_backup_code(conn: asyncpg.Connection, user_id: UUID, code: str) -> bool:
    """Verify and consume a backup code. Returns True if valid."""
    from passlib.context import CryptContext
    ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
    rows = await conn.fetch(
        "SELECT id, code_hash FROM two_factor_backup_codes WHERE user_id = $1 AND used_at IS NULL",
        user_id,
    )
    for row in rows:
        if ctx.verify(code.upper(), row["code_hash"]):
            await conn.execute(
                "UPDATE two_factor_backup_codes SET used_at = now() WHERE id = $1",
                row["id"],
            )
            return True
    return False


# ── Token Rotation ─────────────────────────────────────────────

async def rotate_refresh_token(
    conn: asyncpg.Connection,
    old_token_value: str,
) -> dict:
    """
    Rotate a refresh token. Implements theft detection:
    if the token has already been rotated (a newer token in same family exists),
    revoke the entire family and raise ValueError.
    """
    token_hash = hash_token(old_token_value)

    rt = await conn.fetchrow(
        """
        SELECT id, user_id, family_id, expires_at, revoked_at
        FROM refresh_tokens WHERE token_hash = $1
        """,
        token_hash,
    )

    if not rt:
        raise ValueError("invalid_token")

    if rt["revoked_at"] is not None:
        # Token already used — possible theft. Revoke entire family.
        await conn.execute(
            "UPDATE refresh_tokens SET revoked_at = now() WHERE family_id = $1",
            rt["family_id"],
        )
        raise ValueError("token_reuse_detected")

    if rt["expires_at"] < datetime.now(timezone.utc):
        raise ValueError("expired_token")

    # Fetch user
    user = await conn.fetchrow(
        "SELECT id, email, role FROM users WHERE id = $1",
        rt["user_id"],
    )
    if not user:
        raise ValueError("invalid_token")

    # Revoke old token
    await conn.execute(
        "UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1",
        rt["id"],
    )

    # Issue new access + refresh tokens (same family)
    permissions = get_permissions_for_role(user["role"])
    access_token = create_access_token(
        user_id=str(user["id"]),
        email=user["email"],
        role=user["role"],
        permissions=permissions,
    )
    new_refresh = create_refresh_token()
    new_hash = hash_token(new_refresh)
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)

    await conn.execute(
        """
        INSERT INTO refresh_tokens (user_id, family_id, token_hash, expires_at)
        VALUES ($1, $2, $3, $4)
        """,
        rt["user_id"],
        rt["family_id"],
        new_hash,
        expires_at,
    )

    return {"access_token": access_token, "refresh_token": new_refresh}


# ── Logout ─────────────────────────────────────────────────────

async def logout_user(conn: asyncpg.Connection, refresh_token_value: str) -> None:
    """Revoke refresh token and remove session."""
    if not refresh_token_value:
        return
    token_hash = hash_token(refresh_token_value)
    rt = await conn.fetchrow(
        "SELECT id, user_id FROM refresh_tokens WHERE token_hash = $1",
        token_hash,
    )
    if rt:
        async with conn.transaction():
            await conn.execute(
                "UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1",
                rt["id"],
            )
            await conn.execute(
                "DELETE FROM user_sessions WHERE refresh_token_id = $1",
                rt["id"],
            )


# ── Password Reset ─────────────────────────────────────────────

async def request_password_reset(conn: asyncpg.Connection, email: str) -> None:
    """Always succeeds (enumeration-safe). Sends reset email if user exists."""
    user = await conn.fetchrow(
        "SELECT id, email FROM users WHERE email = $1 AND deleted_at IS NULL",
        email.lower(),
    )
    if not user:
        return  # Silent return — never reveal whether email is registered

    raw_token = secrets.token_urlsafe(32)
    token_hash = hash_token(raw_token)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

    await conn.execute(
        """
        INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
        VALUES ($1, $2, $3)
        """,
        user["id"],
        token_hash,
        expires_at,
    )

    reset_url = f"{settings.app_url}/reset-password?token={raw_token}"
    await send_email(
        to=str(user["email"]),
        subject="Reset your ManaboGo password",
        html=f"""
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <p><a href="{reset_url}">Reset Password</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
        """,
    )


async def reset_password(conn: asyncpg.Connection, token: str, new_password: str) -> None:
    """Reset a user's password using a valid reset token."""
    token_hash = hash_token(token)
    row = await conn.fetchrow(
        """
        SELECT id, user_id, expires_at, used_at
        FROM password_reset_tokens WHERE token_hash = $1
        """,
        token_hash,
    )
    if not row or row["used_at"] is not None:
        raise ValueError("invalid_token")
    if row["expires_at"] < datetime.now(timezone.utc):
        raise ValueError("expired_token")

    # Validate new password
    valid, error_msg = validate_password_strength(new_password)
    if not valid:
        raise ValueError(f"weak_password:{error_msg}")

    pw_hash = hash_password(new_password)

    async with conn.transaction():
        await conn.execute(
            "UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2",
            pw_hash,
            row["user_id"],
        )
        await conn.execute(
            "UPDATE password_reset_tokens SET used_at = now() WHERE id = $1",
            row["id"],
        )
        # Revoke all refresh tokens for the user
        await conn.execute(
            "UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL",
            row["user_id"],
        )


# ── 2FA Setup ──────────────────────────────────────────────────

async def setup_2fa(user_email: str) -> dict:
    """Generate TOTP secret and QR code. Does NOT save to DB yet."""
    secret = generate_totp_secret()
    uri = get_totp_uri(secret, user_email)
    qr_b64 = generate_qr_code_base64(uri)
    return {"secret": secret, "otpauth_url": uri, "qr_code_base64": qr_b64}


async def confirm_2fa(
    conn: asyncpg.Connection,
    user_id: UUID,
    secret: str,
    totp_code: str,
) -> list[str]:
    """Verify TOTP code, save secret, generate backup codes."""
    if not verify_totp_code(secret, totp_code):
        raise ValueError("invalid_totp")

    backup_codes = generate_backup_codes(10)

    from passlib.context import CryptContext
    ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

    async with conn.transaction():
        await conn.execute(
            "UPDATE users SET two_factor_secret = $1, updated_at = now() WHERE id = $2",
            secret,
            user_id,
        )
        # Clear existing backup codes
        await conn.execute(
            "DELETE FROM two_factor_backup_codes WHERE user_id = $1",
            user_id,
        )
        # Insert new hashed backup codes
        for code in backup_codes:
            code_hash = ctx.hash(code)
            await conn.execute(
                "INSERT INTO two_factor_backup_codes (user_id, code_hash) VALUES ($1, $2)",
                user_id,
                code_hash,
            )

    return backup_codes


async def disable_2fa(
    conn: asyncpg.Connection,
    user_id: UUID,
    current_password: str,
    totp_code: str,
) -> None:
    """Disable 2FA after verifying password + TOTP."""
    user = await conn.fetchrow(
        "SELECT password_hash, two_factor_secret FROM users WHERE id = $1",
        user_id,
    )
    if not user or not user["password_hash"]:
        raise ValueError("invalid_credentials")

    if not verify_password(current_password, user["password_hash"]):
        raise ValueError("invalid_credentials")

    if not user["two_factor_secret"]:
        raise ValueError("2fa_not_enabled")

    if not verify_totp_code(user["two_factor_secret"], totp_code):
        raise ValueError("invalid_totp")

    async with conn.transaction():
        await conn.execute(
            "UPDATE users SET two_factor_secret = NULL, updated_at = now() WHERE id = $1",
            user_id,
        )
        await conn.execute(
            "DELETE FROM two_factor_backup_codes WHERE user_id = $1",
            user_id,
        )
