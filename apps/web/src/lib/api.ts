/**
 * Fetch wrapper — auto-attaches Bearer token, silent token refresh on 401.
 *
 * All authenticated API calls from the client go through this.
 * The access_token is read from Zustand (memory only).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface FetchOptions extends RequestInit {
  /** If true, skip the Authorization header (for unauthenticated requests). */
  unauthenticated?: boolean;
}

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

/**
 * Attempt a silent token refresh via the Next.js proxy route.
 * Returns the new access_token or null on failure.
 */
async function silentRefresh(): Promise<string | null> {
  try {
    const resp = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.access_token ?? null;
  } catch {
    return null;
  }
}

/**
 * Main API fetch wrapper.
 * - Reads access_token from Zustand store (import is lazy to avoid SSR issues)
 * - On 401: attempts a single silent refresh and retries
 * - On second 401: clears auth store and rejects
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { unauthenticated = false, ...fetchOptions } = options;
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;

  const getToken = () => {
    if (typeof window === "undefined") return null;
    // Dynamic import to avoid circular deps — authStore is client-only
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { useAuthStore } = require("@/store/authStore");
      return useAuthStore.getState().accessToken as string | null;
    } catch {
      return null;
    }
  };

  const makeRequest = async (token: string | null): Promise<Response> => {
    const headers = new Headers(fetchOptions.headers);
    headers.set("Content-Type", "application/json");
    if (token && !unauthenticated) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return fetch(url, {
      ...fetchOptions,
      headers,
      credentials: "include",
    });
  };

  let token = unauthenticated ? null : getToken();
  let response = await makeRequest(token);

  // Silent refresh on 401
  if (response.status === 401 && !unauthenticated) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await silentRefresh();
      isRefreshing = false;

      if (newToken) {
        // Update Zustand store
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { useAuthStore } = require("@/store/authStore");
          const state = useAuthStore.getState();
          if (state.user) {
            state.setAuth(newToken, state.user);
          }
        } catch {}
        onTokenRefreshed(newToken);
        response = await makeRequest(newToken);
      } else {
        // Refresh failed — clear auth
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { useAuthStore } = require("@/store/authStore");
          useAuthStore.getState().clearAuth();
        } catch {}
        onTokenRefreshed("");
      }
    } else {
      // Already refreshing — queue this request
      const queuedToken = await new Promise<string>((resolve) => {
        addRefreshSubscriber(resolve);
      });
      if (queuedToken) {
        response = await makeRequest(queuedToken);
      }
    }
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({
      detail: "Request failed",
    }));
    throw Object.assign(new Error(errorBody.detail ?? "Request failed"), {
      status: response.status,
      body: errorBody,
    });
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
