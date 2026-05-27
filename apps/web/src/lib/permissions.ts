/**
 * Client-side permission helpers.
 * Mirror of the backend RBAC engine — keeps frontend guards in sync.
 */

import { PermissionKey, Role, ROLE_HIERARCHY } from "@manabogo/shared";

/** Check if a role meets or exceeds the required minimum role. */
export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/** Redirect destination based on user role. */
export function roleHomeRoute(role: Role): string {
  switch (role) {
    case Role.SuperAdmin:
      return "/super-admin";
    case Role.Admin:
      return "/admin";
    case Role.ProUser:
      return "/pro-dashboard";
    case Role.User:
    default:
      return "/dashboard";
  }
}

/** Human-readable role label. */
export function roleLabel(role: Role): string {
  switch (role) {
    case Role.SuperAdmin:
      return "Super Admin";
    case Role.Admin:
      return "Admin";
    case Role.ProUser:
      return "Pro";
    case Role.User:
    default:
      return "Free";
  }
}

/** All permissions for a given role (mirrors backend ROLE_PERMISSIONS). */
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  [Role.User]: [
    PermissionKey.PracticeBasic,
    PermissionKey.MockLimited,
    PermissionKey.AsyncBattle10,
  ],
  [Role.ProUser]: [
    PermissionKey.PracticeBasic,
    PermissionKey.PracticeUnlimited,
    PermissionKey.MockLimited,
    PermissionKey.MockUnlimited,
    PermissionKey.ReadinessReportFull,
    PermissionKey.SyncBattle,
    PermissionKey.AsyncBattle10,
    PermissionKey.AsyncBattleUnlimited,
    PermissionKey.OfflineMode,
    PermissionKey.CertExam,
  ],
  [Role.Admin]: [
    PermissionKey.PracticeBasic,
    PermissionKey.PracticeUnlimited,
    PermissionKey.MockLimited,
    PermissionKey.MockUnlimited,
    PermissionKey.ReadinessReportFull,
    PermissionKey.AsyncBattle10,
    PermissionKey.AsyncBattleUnlimited,
    PermissionKey.AdminUsersRead,
    PermissionKey.AdminUsersWrite,
    PermissionKey.AdminCohorts,
    PermissionKey.AdminAudit,
    PermissionKey.AdminContentModerate,
  ],
  [Role.SuperAdmin]: Object.values(PermissionKey),
};
