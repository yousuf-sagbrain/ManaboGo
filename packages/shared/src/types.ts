/**
 * Shared types between API and web — Role enum, PermissionKey enum,
 * and shared API response interfaces.
 */

// ── Roles ──────────────────────────────────────────────────────

export enum Role {
  User = "user",
  ProUser = "pro_user",
  Admin = "admin",
  SuperAdmin = "super_admin",
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.User]: 1,
  [Role.ProUser]: 2,
  [Role.Admin]: 3,
  [Role.SuperAdmin]: 4,
};

export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// ── Permissions ────────────────────────────────────────────────

export enum PermissionKey {
  // Learning — Free
  PracticeBasic = "practice.basic",
  MockLimited = "mock.limited",
  AsyncBattle10 = "async_battle.10",
  // Learning — Pro
  PracticeUnlimited = "practice.unlimited",
  MockUnlimited = "mock.unlimited",
  ReadinessReportFull = "readiness_report.full",
  SyncBattle = "sync_battle",
  AsyncBattleUnlimited = "async_battle.unlimited",
  OfflineMode = "offline_mode",
  CertExam = "cert_exam",
  // Admin
  AdminUsersRead = "admin.users.read",
  AdminUsersWrite = "admin.users.write",
  AdminCohorts = "admin.cohorts",
  AdminAudit = "admin.audit",
  AdminContentModerate = "admin.content.moderate",
  // Super Admin
  SuperAdminAdminsManage = "super_admin.admins.manage",
  SuperAdminSystemConfig = "super_admin.system.config",
  SuperAdminContentCrud = "super_admin.content.crud",
  SuperAdminFinancials = "super_admin.financials",
  SuperAdminCertMgmt = "super_admin.cert.management",
}

// ── API Response Interfaces ────────────────────────────────────

export interface ApiError {
  detail: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface UserBrief {
  id: string;
  email: string;
  role: Role;
  full_name: string | null;
  email_verified: boolean;
}

export interface UserProfile extends UserBrief {
  avatar_url: string | null;
  two_factor_enabled: boolean;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
  user: UserBrief;
}

export interface RefreshResponse {
  access_token: string;
  token_type: "bearer";
}

export interface RegisterResponse {
  user_id: string;
  email: string;
  message: string;
}

export interface SessionInfo {
  id: string;
  user_agent: string | null;
  ip_address: string | null;
  last_seen: string;
  created_at: string;
}

export interface TwoFactorSetupResponse {
  secret: string;
  otpauth_url: string;
  qr_code_base64: string;
}

export interface TwoFactorConfirmResponse {
  message: string;
  backup_codes: string[];
}

export interface Requires2FAResponse {
  requires_2fa: boolean;
  message: string;
}

export interface Requires2FASetupResponse {
  requires_2fa_setup: boolean;
  message: string;
}

export type LoginResponse =
  | TokenResponse
  | Requires2FAResponse
  | Requires2FASetupResponse;
