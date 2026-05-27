"""All /auth/* endpoints."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status

from app.auth import schemas, service
from app.auth.dependencies import CurrentUser, get_current_user
from app.database import get_db_conn, get_redis

router = APIRouter(prefix="/auth", tags=["auth"])

# ── Cookie settings ───────────────────────────────────────────
REFRESH_COOKIE = "manabogo_refresh"
REFRESH_PATH = "/auth"
REFRESH_MAX_AGE = 30 * 24 * 3600  # 30 days in seconds


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=REFRESH_COOKIE,
        value=token,
        httponly=True,
        secure=True,
        samesite="strict",
        path=REFRESH_PATH,
        max_age=REFRESH_MAX_AGE,
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.set_cookie(
        key=REFRESH_COOKIE,
        value="",
        httponly=True,
        secure=True,
        samesite="strict",
        path=REFRESH_PATH,
        max_age=0,
    )


# ── POST /auth/register ───────────────────────────────────────

@router.post("/register", response_model=schemas.RegisterResponse, status_code=201)
async def register(
    body: schemas.RegisterRequest,
    conn=Depends(get_db_conn),
):
    try:
        user = await service.register_user(
            conn=conn,
            email=body.email,
            password=body.password,
            full_name=body.full_name,
        )
    except ValueError as e:
        err = str(e)
        if err == "email_exists":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )
        if err == "disposable_email":
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Disposable email addresses are not allowed.",
            )
        if err.startswith("weak_password:"):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=err.split(":", 1)[1],
            )
        raise HTTPException(status_code=400, detail="Registration failed.")

    return schemas.RegisterResponse(
        user_id=user["id"],
        email=user["email"],
        message="Verify your email to unlock all features",
    )


# ── GET /auth/verify-email ────────────────────────────────────

@router.get("/verify-email", response_model=schemas.VerifyEmailResponse)
async def verify_email(token: str, conn=Depends(get_db_conn)):
    try:
        await service.verify_email(conn=conn, token=token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e).replace("_", " ").title(),
        )
    return schemas.VerifyEmailResponse(
        message="Email verified. You can now earn XP and badges."
    )


# ── POST /auth/login ──────────────────────────────────────────

@router.post("/login")
async def login(
    body: schemas.LoginRequest,
    request: Request,
    response: Response,
    conn=Depends(get_db_conn),
    redis=Depends(get_redis),
):
    user_agent = request.headers.get("user-agent")
    ip_address = request.client.host if request.client else None

    try:
        result = await service.login_user(
            conn=conn,
            redis=redis,
            email=body.email,
            password=body.password,
            totp_code=body.totp_code,
            user_agent=user_agent,
            ip_address=ip_address,
        )
    except ValueError as e:
        err = str(e)
        if err == "rate_limited":
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many failed login attempts. Try again in 15 minutes.",
            )
        if err == "invalid_totp":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid two-factor authentication code.",
            )
        # Generic 401 — never distinguish email vs password
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    # 2FA setup required (admin/super_admin without 2FA configured)
    if result.get("requires_2fa_setup"):
        return schemas.Requires2FASetupResponse()

    # 2FA code needed
    if result.get("requires_2fa"):
        return schemas.Requires2FAResponse()

    # Success — set refresh cookie + return access token
    _set_refresh_cookie(response, result["refresh_token"])
    return schemas.TokenResponse(
        access_token=result["access_token"],
        user=schemas.UserBrief(**result["user"]),
    )


# ── POST /auth/refresh ────────────────────────────────────────

@router.post("/refresh", response_model=schemas.RefreshResponse)
async def refresh_token(
    response: Response,
    conn=Depends(get_db_conn),
    manabogo_refresh: str | None = Cookie(default=None),
):
    if not manabogo_refresh:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token provided.",
        )
    try:
        result = await service.rotate_refresh_token(conn=conn, old_token_value=manabogo_refresh)
    except ValueError as e:
        err = str(e)
        _clear_refresh_cookie(response)
        if err == "token_reuse_detected":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token reuse detected. All sessions revoked.",
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )

    _set_refresh_cookie(response, result["refresh_token"])
    return schemas.RefreshResponse(access_token=result["access_token"])


# ── POST /auth/logout ─────────────────────────────────────────

@router.post("/logout", response_model=schemas.LogoutResponse)
async def logout(
    response: Response,
    conn=Depends(get_db_conn),
    manabogo_refresh: str | None = Cookie(default=None),
):
    if manabogo_refresh:
        await service.logout_user(conn=conn, refresh_token_value=manabogo_refresh)
    _clear_refresh_cookie(response)
    return schemas.LogoutResponse()


# ── POST /auth/forgot-password ────────────────────────────────

@router.post("/forgot-password", response_model=schemas.ForgotPasswordResponse)
async def forgot_password(body: schemas.ForgotPasswordRequest, conn=Depends(get_db_conn)):
    # Always succeeds — enumeration-safe
    await service.request_password_reset(conn=conn, email=body.email)
    return schemas.ForgotPasswordResponse()


# ── POST /auth/reset-password ─────────────────────────────────

@router.post("/reset-password", response_model=schemas.ResetPasswordResponse)
async def reset_password(body: schemas.ResetPasswordRequest, conn=Depends(get_db_conn)):
    try:
        await service.reset_password(
            conn=conn,
            token=body.token,
            new_password=body.new_password,
        )
    except ValueError as e:
        err = str(e)
        if err.startswith("weak_password:"):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=err.split(":", 1)[1],
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token.",
        )
    return schemas.ResetPasswordResponse()


# ── POST /auth/2fa/setup ──────────────────────────────────────

@router.post("/2fa/setup", response_model=schemas.TwoFactorSetupResponse)
async def two_factor_setup(
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Generate TOTP secret + QR code. Does NOT save to DB until /2fa/confirm.
    The secret is returned to the client and must be submitted with /2fa/confirm.
    """
    result = await service.setup_2fa(current_user.email)
    return schemas.TwoFactorSetupResponse(**result)


# ── POST /auth/2fa/confirm ────────────────────────────────────

@router.post("/2fa/confirm", response_model=schemas.TwoFactorConfirmResponse)
async def two_factor_confirm(
    body: schemas.TwoFactorConfirmRequest,
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
    conn=Depends(get_db_conn),
):
    """
    Confirm TOTP setup. Requires the secret from /2fa/setup (passed via body)
    and a valid TOTP code.
    NOTE: The secret must be stored temporarily on the client (e.g., in component state)
    between /2fa/setup and /2fa/confirm.
    """
    # Get secret from header (client passes it back)
    secret = request.headers.get("X-2FA-Secret")
    if not secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA secret missing from request headers.",
        )
    try:
        backup_codes = await service.confirm_2fa(
            conn=conn,
            user_id=current_user.id,
            secret=secret,
            totp_code=body.totp_code,
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid TOTP code.",
        )
    return schemas.TwoFactorConfirmResponse(backup_codes=backup_codes)


# ── DELETE /auth/2fa ──────────────────────────────────────────

@router.delete("/2fa", response_model=schemas.TwoFactorDisableResponse)
async def two_factor_disable(
    body: schemas.TwoFactorDisableRequest,
    current_user: CurrentUser = Depends(get_current_user),
    conn=Depends(get_db_conn),
):
    try:
        await service.disable_2fa(
            conn=conn,
            user_id=current_user.id,
            current_password=body.current_password,
            totp_code=body.totp_code,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    return schemas.TwoFactorDisableResponse()


# ── Social Login Stubs ────────────────────────────────────────
# LINE is critical for Japan / Thailand / Taiwan / Indonesia markets.
# Google, Apple, LINE OAuth — implement in Task #10 (DEFERRABLE)

@router.get("/oauth/{provider}/authorize", status_code=501)
async def oauth_authorize(provider: str):
    _validate_provider(provider)
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail=f"Social login ({provider}) not yet implemented.",
    )


@router.get("/oauth/{provider}/callback", status_code=501)
async def oauth_callback(provider: str):
    _validate_provider(provider)
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail=f"Social login ({provider}) not yet implemented.",
    )


def _validate_provider(provider: str) -> None:
    valid = {"google", "apple", "line"}
    if provider not in valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid provider. Must be one of: {', '.join(sorted(valid))}",
        )


# ── Certificate stub (Phase 5) ────────────────────────────────

@router.get("/certificates/{cert_id}", status_code=404, include_in_schema=False)
async def get_certificate_stub(cert_id: str):
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Certificate system not yet implemented.",
    )
