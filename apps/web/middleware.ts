/**
 * Next.js Edge Middleware — auth + role routing + i18n.
 *
 * This is the single source of truth for route protection.
 * Runs on the Edge before any page renders — no flash of unauthenticated content.
 */

import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

// ── Locale config ──────────────────────────────────────────────
const SUPPORTED_LOCALES = ["en", "ja", "bn", "id", "vi"] as const;
const DEFAULT_LOCALE = "en";

const intlMiddleware = createIntlMiddleware({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localeDetection: true,
});

// ── Role hierarchy ─────────────────────────────────────────────
const ROLE_HIERARCHY: Record<string, number> = {
  user: 1,
  pro_user: 2,
  admin: 3,
  super_admin: 4,
};

function hasMinimumRole(userRole: string, requiredRole: string): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 99);
}

// ── Route rules ────────────────────────────────────────────────
const ROUTE_RULES = [
  {
    pattern: /^\/(dashboard|learn|settings)(\/|$)/,
    role: "user",
    redirect: "/login",
  },
  {
    pattern: /^\/pro-dashboard(\/|$)/,
    role: "pro_user",
    redirect: "/dashboard",
  },
  {
    pattern: /^\/admin(\/|$)/,
    role: "admin",
    redirect: "/dashboard",
  },
  {
    pattern: /^\/super-admin(\/|$)/,
    role: "super_admin",
    redirect: "/dashboard",
  },
  {
    pattern: /^\/auth\/2fa-setup(\/|$)/,
    role: "any_authed",
    redirect: "/login",
  },
] as const;

// ── Public routes (pass through without auth check) ────────────
const PUBLIC_PATTERNS = [
  /^\/$/,
  /^\/pricing(\/|$)/,
  /^\/about(\/|$)/,
  /^\/verify\//,
  /^\/login(\/|$)/,
  /^\/register(\/|$)/,
  /^\/verify-email(\/|$)/,
  /^\/reset-password(\/|$)/,
  /^\/forgot-password(\/|$)/,
  /^\/_next\//,
  /^\/api\//,
  /^\/fonts\//,
  /^\/favicon/,
  /\.(png|jpg|jpeg|svg|ico|webp|woff2?|ttf|otf)$/,
];

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY ?? "change-me-in-production-minimum-32-characters"
);

interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  permissions: string[];
  requires_2fa_setup?: boolean;
  type: string;
}

async function decodeToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Strip locale prefix for route matching ─────────────────
  const pathnameWithoutLocale = SUPPORTED_LOCALES.reduce((path, locale) => {
    if (path.startsWith(`/${locale}/`) || path === `/${locale}`) {
      return path.slice(locale.length + 1) || "/";
    }
    return path;
  }, pathname);

  // ── Public routes pass through ─────────────────────────────
  const isPublic = PUBLIC_PATTERNS.some((pattern) =>
    pattern.test(pathnameWithoutLocale)
  );
  if (isPublic) {
    return intlMiddleware(request);
  }

  // ── Read access token from cookie (set by Next.js API route) ──
  const accessToken = request.cookies.get("manabogo_access")?.value;
  const payload = accessToken ? await decodeToken(accessToken) : null;

  // ── 2FA setup redirect ─────────────────────────────────────
  if (payload?.requires_2fa_setup && pathnameWithoutLocale !== "/auth/2fa-setup") {
    return NextResponse.redirect(new URL("/auth/2fa-setup", request.url));
  }

  // ── Check route rules ──────────────────────────────────────
  for (const rule of ROUTE_RULES) {
    if (!rule.pattern.test(pathnameWithoutLocale)) continue;

    if (rule.role === "any_authed") {
      if (!payload) {
        return NextResponse.redirect(new URL(rule.redirect, request.url));
      }
      break;
    }

    if (!payload) {
      const loginUrl = new URL(rule.redirect, request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!hasMinimumRole(payload.role, rule.role)) {
      return NextResponse.redirect(new URL(rule.redirect, request.url));
    }

    break; // First matching rule wins
  }

  // ── Run next-intl middleware ───────────────────────────────
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
