"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TwoFactorInput } from "@/components/auth/TwoFactorInput";
import { useAuthStore, roleHomeRoute } from "@/store/authStore";
import type { TokenResponse, Requires2FAResponse } from "@manabogo/shared";
import { Role } from "@manabogo/shared";

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [requires2fa, setRequires2fa] = useState(false);
  const [requires2faSetup, setRequires2faSetup] = useState(false);

  const handleSubmit = async (e: React.FormEvent, totpCode?: string) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, totp_code: totpCode }),
        credentials: "include",
      });

      const data = await resp.json();

      if (!resp.ok) {
        setError("Invalid email or password.");
        return;
      }

      if ("requires_2fa_setup" in data && data.requires_2fa_setup) {
        setRequires2faSetup(true);
        router.push("/auth/2fa-setup");
        return;
      }

      if ("requires_2fa" in data && data.requires_2fa) {
        setRequires2fa(true);
        return;
      }

      const tokenData = data as TokenResponse;
      setAuth(tokenData.access_token, {
        id: tokenData.user.id,
        email: tokenData.user.email,
        fullName: tokenData.user.full_name ?? null,
        role: tokenData.user.role as Role,
        permissions: [],
        emailVerified: tokenData.user.email_verified,
      });

      router.push(roleHomeRoute(tokenData.user.role as Role));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (requires2fa) {
    return (
      <TwoFactorInput
        onSubmit={(code) =>
          handleSubmit({ preventDefault: () => {} } as React.FormEvent, code)
        }
        isLoading={isLoading}
        error={error}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Input
        label="Email address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
        placeholder="you@example.com"
      />

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          placeholder="••••••••••"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex items-center justify-end">
        <Link
          href="/reset-password"
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" fullWidth isLoading={isLoading}>
        Sign in
      </Button>

      <p className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">
          Create account
        </Link>
      </p>
    </form>
  );
}
