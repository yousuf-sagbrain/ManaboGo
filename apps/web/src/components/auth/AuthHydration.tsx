"use client";

/**
 * Mounts once inside the (app) shell. On first render it calls the refresh
 * endpoint so the Zustand store is populated even after a hard page reload.
 *
 * The middleware already guards the route via the HttpOnly cookie, so this is
 * purely a client-side store rehydration — the user never sees a flash.
 */

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import type { TokenResponse } from "@manabogo/shared";
import { Role } from "@manabogo/shared";

export function AuthHydration() {
  const { isHydrated, accessToken, setAuth, clearAuth, setHydrated } =
    useAuthStore();

  useEffect(() => {
    if (isHydrated) return; // already populated (e.g. just logged in)

    let cancelled = false;

    async function hydrate() {
      try {
        const resp = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (cancelled) return;

        if (!resp.ok) {
          // Refresh token missing or expired — middleware will redirect, but
          // mark hydrated so the UI doesn't stay in limbo.
          clearAuth();
          return;
        }

        const data: TokenResponse = await resp.json();
        if (cancelled) return;

        setAuth(data.access_token, {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.full_name ?? null,
          role: data.user.role as Role,
          permissions: [],
          emailVerified: data.user.email_verified,
        });
      } catch {
        if (!cancelled) setHydrated(true);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [isHydrated, accessToken, setAuth, clearAuth, setHydrated]);

  return null;
}
