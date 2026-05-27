"""RBAC permission bundles for ManaboGo's four roles.

JWT access token payload includes permissions: list[str] so backend
endpoints can check permissions without a DB query on every request.
"""

from enum import Enum


class PermissionKey(str, Enum):
    # ── Learning — Free ───────────────────────────────────────
    PRACTICE_BASIC = "practice.basic"
    MOCK_LIMITED = "mock.limited"               # 1 Quick/wk, 1 Section/mo
    ASYNC_BATTLE_10 = "async_battle.10"          # 10 battles/wk

    # ── Learning — Pro ────────────────────────────────────────
    PRACTICE_UNLIMITED = "practice.unlimited"
    MOCK_UNLIMITED = "mock.unlimited"
    READINESS_REPORT_FULL = "readiness_report.full"
    SYNC_BATTLE = "sync_battle"
    ASYNC_BATTLE_UNLIMITED = "async_battle.unlimited"
    OFFLINE_MODE = "offline_mode"
    CERT_EXAM = "cert_exam"                      # N5 certification attempt

    # ── Admin ─────────────────────────────────────────────────
    ADMIN_USERS_READ = "admin.users.read"
    ADMIN_USERS_WRITE = "admin.users.write"
    ADMIN_COHORTS = "admin.cohorts"
    ADMIN_AUDIT = "admin.audit"
    ADMIN_CONTENT_MODERATE = "admin.content.moderate"

    # ── Super Admin ───────────────────────────────────────────
    SUPER_ADMIN_ADMINS_MANAGE = "super_admin.admins.manage"
    SUPER_ADMIN_SYSTEM_CONFIG = "super_admin.system.config"
    SUPER_ADMIN_CONTENT_CRUD = "super_admin.content.crud"
    SUPER_ADMIN_FINANCIALS = "super_admin.financials"
    SUPER_ADMIN_CERT_MGMT = "super_admin.cert.management"


# ── Role → Permission bundles ─────────────────────────────────
ROLE_PERMISSIONS: dict[str, list[str]] = {
    "user": [
        PermissionKey.PRACTICE_BASIC,
        PermissionKey.MOCK_LIMITED,
        PermissionKey.ASYNC_BATTLE_10,
    ],
    "pro_user": [
        PermissionKey.PRACTICE_BASIC,
        PermissionKey.PRACTICE_UNLIMITED,
        PermissionKey.MOCK_LIMITED,
        PermissionKey.MOCK_UNLIMITED,
        PermissionKey.READINESS_REPORT_FULL,
        PermissionKey.SYNC_BATTLE,
        PermissionKey.ASYNC_BATTLE_10,
        PermissionKey.ASYNC_BATTLE_UNLIMITED,
        PermissionKey.OFFLINE_MODE,
        PermissionKey.CERT_EXAM,
    ],
    "admin": [
        PermissionKey.PRACTICE_BASIC,
        PermissionKey.PRACTICE_UNLIMITED,
        PermissionKey.MOCK_LIMITED,
        PermissionKey.MOCK_UNLIMITED,
        PermissionKey.READINESS_REPORT_FULL,
        PermissionKey.ASYNC_BATTLE_10,
        PermissionKey.ASYNC_BATTLE_UNLIMITED,
        PermissionKey.ADMIN_USERS_READ,
        PermissionKey.ADMIN_USERS_WRITE,
        PermissionKey.ADMIN_COHORTS,
        PermissionKey.ADMIN_AUDIT,
        PermissionKey.ADMIN_CONTENT_MODERATE,
    ],
    "super_admin": [p for p in PermissionKey],  # all permissions
}


def get_permissions_for_role(role: str) -> list[str]:
    """Return the list of permission strings for a given role."""
    return [p.value for p in ROLE_PERMISSIONS.get(role, [])]
