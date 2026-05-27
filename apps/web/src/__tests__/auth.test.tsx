/**
 * Frontend auth tests — Vitest + React Testing Library
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// ── Mocks ──────────────────────────────────────────────────────
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

vi.mock("@/store/authStore", () => ({
  useAuthStore: (selector: any) => {
    const state = {
      accessToken: null,
      user: null,
      isHydrated: true,
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
      hasPermission: vi.fn(() => false),
    };
    return selector(state);
  },
  roleHomeRoute: (role: string) => {
    if (role === "pro_user") return "/pro-dashboard";
    if (role === "admin") return "/admin";
    if (role === "super_admin") return "/super-admin";
    return "/dashboard";
  },
}));

vi.mock("@manabogo/shared", () => ({
  Role: {
    User: "user",
    ProUser: "pro_user",
    Admin: "admin",
    SuperAdmin: "super_admin",
  },
}));

// ── Helpers ────────────────────────────────────────────────────
function mockFetch(data: object, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  } as any);
}

// ── LoginForm tests ────────────────────────────────────────────
import { LoginForm } from "@/components/auth/LoginForm";

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form with email, password, submit button", () => {
    render(<LoginForm />);
    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows generic error on 401 response (no detail leakage)", async () => {
    mockFetch({ detail: "Invalid email or password." }, 401);
    render(<LoginForm />);

    await userEvent.type(screen.getByRole("textbox", { name: /email/i }), "test@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "wrongpassword");
    fireEvent.submit(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
    // Should NOT reveal which field was wrong
    expect(screen.queryByText(/email not found/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/password incorrect/i)).not.toBeInTheDocument();
  });

  it("shows 2FA input when API returns requires_2fa: true", async () => {
    mockFetch({ requires_2fa: true, message: "2FA required" }, 200);
    render(<LoginForm />);

    await userEvent.type(screen.getByRole("textbox", { name: /email/i }), "user@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "StrongPass123!");
    fireEvent.submit(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/two-factor authentication/i)).toBeInTheDocument();
    });
  });

  it("redirects to /dashboard on successful user login", async () => {
    mockFetch({
      access_token: "token123",
      token_type: "bearer",
      user: { id: "uuid", email: "user@example.com", role: "user", full_name: null, email_verified: true },
    }, 200);
    render(<LoginForm />);

    await userEvent.type(screen.getByRole("textbox", { name: /email/i }), "user@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "StrongPass123!");
    fireEvent.submit(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("redirects to /pro-dashboard on successful pro_user login", async () => {
    mockFetch({
      access_token: "token123",
      token_type: "bearer",
      user: { id: "uuid", email: "pro@example.com", role: "pro_user", full_name: null, email_verified: true },
    }, 200);
    render(<LoginForm />);

    await userEvent.type(screen.getByRole("textbox", { name: /email/i }), "pro@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "StrongPass123!");
    fireEvent.submit(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/pro-dashboard");
    });
  });

  it("redirects to /admin on successful admin login", async () => {
    mockFetch({
      access_token: "token123",
      token_type: "bearer",
      user: { id: "uuid", email: "admin@example.com", role: "admin", full_name: null, email_verified: true },
    }, 200);
    render(<LoginForm />);

    await userEvent.type(screen.getByRole("textbox", { name: /email/i }), "admin@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "StrongPass123!");
    fireEvent.submit(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin");
    });
  });
});

// ── RegisterForm tests ─────────────────────────────────────────
import { RegisterForm } from "@/components/auth/RegisterForm";

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("register form shows strength meter on password input", async () => {
    render(<RegisterForm />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    await userEvent.type(passwordInput, "weakpassword");

    // PasswordStrengthBar should appear
    await waitFor(() => {
      expect(screen.getByText(/weak|fair|strong/i)).toBeInTheDocument();
    });
  });

  it("register success shows verify-email banner without redirect", async () => {
    mockFetch({ user_id: "uuid", email: "new@example.com", message: "Verify your email" }, 201);
    render(<RegisterForm />);

    await userEvent.type(screen.getByRole("textbox", { name: /email/i }), "new@example.com");
    await userEvent.type(screen.getByLabelText(/^password$/i), "StrongPass123!");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "StrongPass123!");
    fireEvent.submit(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
    // Must NOT redirect
    expect(mockPush).not.toHaveBeenCalled();
  });
});

// ── ResetPasswordForm tests ────────────────────────────────────
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

describe("ResetPasswordForm", () => {
  it("reset-password shows enumeration-safe message", async () => {
    mockFetch({ message: "If that email exists, we've sent a reset link." }, 200);
    render(<ResetPasswordForm />);

    await userEvent.type(screen.getByRole("textbox", { name: /email/i }), "anyone@example.com");
    fireEvent.submit(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/if that email exists/i)).toBeInTheDocument();
    });
  });
});
