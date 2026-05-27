"use client";

/**
 * Zustand auth store — access_token lives in MEMORY ONLY.
 * Never written to localStorage or sessionStorage.
 */

import { create } from "zustand";
import { Role } from "@manabogo/shared";

interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
  permissions: string[];
  emailVerified: boolean;
}

interface AuthState {
  /** JWT access token — in-memory only, never persisted. */
  accessToken: string | null;
  user: AuthUser | null;
  /** True after the first client render + silent refresh attempt. */
  isHydrated: boolean;

  // Actions
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
  setHydrated: (value: boolean) => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  isHydrated: false,

  setAuth: (token, user) => {
    set({ accessToken: token, user, isHydrated: true });
  },

  clearAuth: () => {
    set({ accessToken: null, user: null, isHydrated: true });
  },

  setHydrated: (value) => {
    set({ isHydrated: value });
  },

  hasPermission: (permission) => {
    const { user } = get();
    if (!user) return false;
    return user.permissions.includes(permission);
  },
}));

// ── Role → home route mapping ──────────────────────────────────
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
