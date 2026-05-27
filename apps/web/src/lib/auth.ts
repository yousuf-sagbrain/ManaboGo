/**
 * Server-side auth helper — reads + verifies JWT from the HTTP-only cookie.
 * Used in Server Component layouts and Next.js middleware.
 */

import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { Role } from "@manabogo/shared";

const JWT_SECRET = process.env.NEXTAUTH_SECRET ?? "change-me-32-chars";
const COOKIE_NAME = "manabogo_access";

export interface CurrentUser {
  id: string;
  email: string;
  role: Role;
  permissions: string[];
  emailVerified?: boolean;
  requires2faSetup?: boolean;
}

/**
 * Read + verify the JWT access token from the manabogo_access cookie.
 * Returns CurrentUser or null if no valid token exists.
 * Used in Server Components (layouts, pages).
 */
export async function getServerSession(): Promise<CurrentUser | null> {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(COOKIE_NAME);
    if (!tokenCookie?.value) return null;

    return await verifyAccessToken(tokenCookie.value);
  } catch {
    return null;
  }
}

/**
 * Verify a JWT string — used by both the server session helper and middleware.
 * Uses jose (Edge-compatible).
 */
export async function verifyAccessToken(
  token: string
): Promise<CurrentUser | null> {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET_KEY ?? JWT_SECRET
    );
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    if (payload.type !== "access") return null;
    if (!payload.sub || !payload.email || !payload.role) return null;

    return {
      id: payload.sub,
      email: payload.email as string,
      role: payload.role as Role,
      permissions: (payload.permissions as string[]) ?? [],
      requires2faSetup: (payload.requires_2fa_setup as boolean) ?? false,
    };
  } catch {
    return null;
  }
}
