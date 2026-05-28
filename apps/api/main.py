"""FastAPI application factory — ManaboGo API."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.router import router as auth_router
from app.config import settings
from app.content.router import router as content_router
from app.core.exceptions import register_exception_handlers
from app.database import lifespan
from app.users.router import router as users_router

# ── Certificate stub endpoint (Phase 5) ──────────────────────
from fastapi import APIRouter
certificates_router = APIRouter(prefix="/certificates", tags=["certificates"])


@certificates_router.get("/{cert_id}", status_code=404)
async def get_certificate(cert_id: str):
    from fastapi import HTTPException
    raise HTTPException(
        status_code=404,
        detail="Certificate system not yet implemented.",
    )


# ── App factory ───────────────────────────────────────────────

def create_app() -> FastAPI:
    app = FastAPI(
        title="ManaboGo API",
        description="Global JLPT N5 Japanese Learning Platform — Phase 0",
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
    )

    # ── CORS ──────────────────────────────────────────────────
    origins = [
        settings.app_url,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routers ───────────────────────────────────────────────
    app.include_router(auth_router)
    app.include_router(users_router)
    app.include_router(content_router)
    app.include_router(certificates_router)

    # ── Exception handlers ────────────────────────────────────
    register_exception_handlers(app)

    # ── Health check ──────────────────────────────────────────
    @app.get("/health", tags=["system"])
    async def health():
        return {"status": "ok", "version": "0.1.0"}

    return app


app = create_app()
