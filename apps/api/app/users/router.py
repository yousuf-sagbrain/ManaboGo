"""Account management endpoints: /users/me."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.auth.dependencies import CurrentUser, get_current_user
from app.database import get_db_conn
from app.users import schemas, service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=schemas.UserProfile)
async def get_me(
    current_user: CurrentUser = Depends(get_current_user),
    conn=Depends(get_db_conn),
):
    try:
        profile = await service.get_user_profile(conn, current_user.id)
    except ValueError:
        raise HTTPException(status_code=404, detail="User not found.")
    return schemas.UserProfile(**profile)


@router.patch("/me", response_model=schemas.UserProfile)
async def update_me(
    body: schemas.UpdateProfileRequest,
    current_user: CurrentUser = Depends(get_current_user),
    conn=Depends(get_db_conn),
):
    try:
        profile = await service.update_user_profile(
            conn,
            current_user.id,
            body.full_name,
            body.avatar_url,
        )
    except ValueError:
        raise HTTPException(status_code=404, detail="User not found.")
    return schemas.UserProfile(**profile)


@router.post("/me/change-password", response_model=schemas.UserProfile)
async def change_password(
    body: schemas.ChangePasswordRequest,
    current_user: CurrentUser = Depends(get_current_user),
    conn=Depends(get_db_conn),
):
    try:
        await service.change_password(
            conn,
            current_user.id,
            body.current_password,
            body.new_password,
        )
    except ValueError as e:
        err = str(e)
        if err == "invalid_credentials":
            raise HTTPException(status_code=400, detail="Current password is incorrect.")
        if err.startswith("weak_password:"):
            raise HTTPException(status_code=422, detail=err.split(":", 1)[1])
        raise HTTPException(status_code=400, detail="Password change failed.")

    profile = await service.get_user_profile(conn, current_user.id)
    return schemas.UserProfile(**profile)


@router.get("/me/sessions", response_model=list[schemas.SessionInfo])
async def list_sessions(
    current_user: CurrentUser = Depends(get_current_user),
    conn=Depends(get_db_conn),
):
    sessions = await service.get_user_sessions(conn, current_user.id)
    return [schemas.SessionInfo(**s) for s in sessions]


@router.delete("/me/sessions/{session_id}", status_code=204)
async def revoke_session(
    session_id: UUID,
    current_user: CurrentUser = Depends(get_current_user),
    conn=Depends(get_db_conn),
):
    try:
        await service.revoke_session(conn, current_user.id, session_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Session not found.")


@router.post("/me/avatar", response_model=schemas.AvatarUploadResponse)
async def upload_avatar(
    current_user: CurrentUser = Depends(get_current_user),
    conn=Depends(get_db_conn),
    file: UploadFile = File(...),
):
    data = await file.read()
    try:
        avatar_url = await service.save_avatar(
            conn,
            current_user.id,
            file.content_type or "",
            data,
        )
    except ValueError as e:
        err = str(e)
        if err == "invalid_mime":
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Only JPEG, PNG, and WebP images are allowed.",
            )
        if err == "file_too_large":
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Image must be 2 MB or smaller.",
            )
        raise HTTPException(status_code=400, detail="Avatar upload failed.")
    return schemas.AvatarUploadResponse(avatar_url=avatar_url)


@router.get("/me/gdpr-export", response_model=schemas.GdprExportResponse)
async def gdpr_export(
    current_user: CurrentUser = Depends(get_current_user),
    conn=Depends(get_db_conn),
):
    try:
        data = await service.build_gdpr_export(conn, current_user.id)
    except ValueError:
        raise HTTPException(status_code=404, detail="User not found.")
    return data


@router.delete("/me", status_code=200)
async def delete_account(
    current_user: CurrentUser = Depends(get_current_user),
    conn=Depends(get_db_conn),
):
    await service.soft_delete_user(conn, current_user.id)
    return schemas.DeleteAccountResponse()
