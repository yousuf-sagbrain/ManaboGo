"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordStrengthBar } from "@/components/ui/PasswordStrengthBar";

/** State A — no token: ask for email. State B — token present: new password. */
export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return token ? <ResetWithToken token={token} /> : <ForgotPasswordForm />;
}

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {}
    // Always show the same message — enumeration-safe
    setSubmitted(true);
    setIsLoading(false);
  };

  if (submitted) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-slate-900">Check your email</h2>
        <p className="text-sm text-slate-500">
          If that email exists, we&apos;ve sent a reset link. Check your inbox (and spam folder).
        </p>
        <Link href="/login" className="inline-block text-sm text-indigo-600 font-semibold hover:text-indigo-700">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Email address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="you@example.com"
        autoComplete="email"
      />
      <Button type="submit" fullWidth isLoading={isLoading}>
        Send reset link
      </Button>
      <p className="text-center text-sm text-slate-500">
        <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

function ResetWithToken({ token }: { token: string }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const resp = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        setError(data.detail ?? "Reset failed. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 bg-jade/10 rounded-2xl flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-jade" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-slate-900">Password updated!</h2>
        <p className="text-sm text-slate-500">You can now sign in with your new password.</p>
        <Link href="/login" className="inline-block text-sm text-indigo-600 font-semibold hover:text-indigo-700">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}
      <div>
        <Input
          label="New password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          autoComplete="new-password"
          hint="Min 10 characters with uppercase, lowercase, digit, and symbol."
        />
        <PasswordStrengthBar password={newPassword} />
      </div>
      <Input
        label="Confirm new password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        autoComplete="new-password"
        error={confirmPassword && newPassword !== confirmPassword ? "Passwords do not match." : undefined}
      />
      <Button type="submit" fullWidth isLoading={isLoading}>
        Update password
      </Button>
    </form>
  );
}
