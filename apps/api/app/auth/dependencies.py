"""FastAPI dependencies: get_current_user() and require_permission()."""

from __future__ import annotations

from typing import Callable
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from pydantic import BaseModel

from app.auth.permissions import PermissionKey
from app.auth.utils import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)


class CurrentUser(BaseModel):
    id: UUID
    email: str
    role: str
    permissions: list[str]


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> CurrentUser:
    """
    FastAPI dependency: decode JWT from Authorization: Bearer header.
    Raises HTTP 401 if token is missing, invalid, or expired.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = decode_access_token(credentials.credentials)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    return CurrentUser(
        id=payload["sub"],
        email=payload["email"],
        role=payload["role"],
        permissions=payload.get("permissions", []),
    )


def require_permission(permission: PermissionKey) -> Callable:
    """
    FastAPI dependency factory — checks for a specific permission in the JWT.
    Zero DB queries: reads permissions list from token payload.

    Usage:
        @router.get("/resource")
        async def endpoint(
            user: CurrentUser = Depends(require_permission(PermissionKey.PRACTICE_UNLIMITED))
        ):
            ...
    """
    async def _check(
        current_user: CurrentUser = Depends(get_current_user),
    ) -> CurrentUser:
        if permission.value not in current_user.permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission required: {permission.value}",
            )
        return current_user

    return _check


def require_role(*roles: str) -> Callable:
    """
    FastAPI dependency factory — checks user role is in the allowed set.
    Usage: Depends(require_role("admin", "super_admin"))
    """
    async def _check(
        current_user: CurrentUser = Depends(get_current_user),
    ) -> CurrentUser:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient role",
            )
        return current_user

    return _check
