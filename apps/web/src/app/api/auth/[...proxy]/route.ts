/**
 * Next.js API route — Auth token proxy.
 *
 * Acts as a cookie-setting intermediary between the browser and FastAPI.
 * Browser JS cannot set HttpOnly cookies directly — this route does it.
 *
 * Routes handled:
 *   POST /api/auth/login          → proxy to FastAPI, set cookies
 *   POST /api/auth/logout         → proxy to FastAPI, clear cookies
 *   POST /api/auth/refresh        → proxy to FastAPI, update access cookie
 *   POST /api/auth/register       → proxy to FastAPI
 *   POST /api/auth/forgot-password → proxy to FastAPI
 *   POST /api/auth/reset-password  → proxy to FastAPI
 */

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Cookie settings
const SECURE = process.env.NODE_ENV === "production";
const SAMESITE = "strict" as const;

// 15 minutes for access token
const ACCESS_MAX_AGE = 15 * 60;
// 30 days for refresh token
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60;

function setAccessCookie(response: NextResponse, token: string) {
  response.cookies.set("manabogo_access", token, {
    httpOnly: false, // Readable by middleware (Edge)
    secure: SECURE,
    sameSite: SAMESITE,
    maxAge: ACCESS_MAX_AGE,
    path: "/",
  });
}

function setRefreshCookie(response: NextResponse, token: string) {
  response.cookies.set("manabogo_refresh", token, {
    httpOnly: true, // NOT readable by JS
    secure: SECURE,
    sameSite: SAMESITE,
    maxAge: REFRESH_MAX_AGE,
    path: "/auth",
  });
}

function clearAuthCookies(response: NextResponse) {
  response.cookies.set("manabogo_access", "", { maxAge: 0, path: "/" });
  response.cookies.set("manabogo_refresh", "", {
    maxAge: 0,
    path: "/auth",
    httpOnly: true,
  });
}

type RouteContext = { params: Promise<{ proxy: string[] }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const { proxy } = await context.params;
  const subpath = proxy.join("/"); // e.g. "login", "logout", "refresh"

  // Build FastAPI URL
  const apiPath = `/auth/${subpath}`;
  const apiUrl = `${API_URL}${apiPath}`;

  // Forward the request body
  const body = await request.text();

  // Forward cookies (refresh token for /refresh and /logout)
  const forwardedCookies = request.cookies.getAll();
  const cookieHeader = forwardedCookies
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  // Forward to FastAPI
  const apiResponse = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    body: body || undefined,
  });

  const responseData = await apiResponse.json().catch(() => ({}));

  const nextResponse = NextResponse.json(responseData, {
    status: apiResponse.status,
  });

  // ── Handle cookies based on the endpoint ──────────────────
  if (apiResponse.ok) {
    if (subpath === "login" && responseData.access_token) {
      // Set access token cookie (middleware-readable)
      setAccessCookie(nextResponse, responseData.access_token);

      // Extract refresh token from FastAPI Set-Cookie header
      const setCookieHeader = apiResponse.headers.get("set-cookie");
      if (setCookieHeader) {
        const refreshMatch = /manabogo_refresh=([^;]+)/.exec(setCookieHeader);
        if (refreshMatch) {
          setRefreshCookie(nextResponse, refreshMatch[1]);
        }
      }
    }

    if (subpath === "refresh" && responseData.access_token) {
      setAccessCookie(nextResponse, responseData.access_token);

      const setCookieHeader = apiResponse.headers.get("set-cookie");
      if (setCookieHeader) {
        const refreshMatch = /manabogo_refresh=([^;]+)/.exec(setCookieHeader);
        if (refreshMatch) {
          setRefreshCookie(nextResponse, refreshMatch[1]);
        }
      }
    }

    if (subpath === "logout") {
      clearAuthCookies(nextResponse);
    }
  }

  return nextResponse;
}

// Support GET for /api/auth/verify-email?token=...
export async function GET(request: NextRequest, context: RouteContext) {
  const { proxy } = await context.params;
  const subpath = proxy.join("/");

  const { searchParams } = request.nextUrl;
  const queryString = searchParams.toString();
  const apiUrl = `${API_URL}/auth/${subpath}${queryString ? `?${queryString}` : ""}`;

  const apiResponse = await fetch(apiUrl, { method: "GET" });
  const responseData = await apiResponse.json().catch(() => ({}));

  return NextResponse.json(responseData, { status: apiResponse.status });
}
