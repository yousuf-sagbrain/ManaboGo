"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

type State = "loading" | "success" | "error";

const RESEND_COOLDOWN = 120; // seconds, must match backend (2 min)

export function VerifyEmailView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<State>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  // Resend form state
  const [resendEmail, setResendEmail] = useState("");
  const [resendSending, setResendSending] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const [resendError, setResendError] = useState("");
  const [cooldown, setCooldown] = useState(0); // seconds remaining
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setState("error");
      setErrorMessage("No verification token found in the URL.");
      return;
    }

    const verify = async () => {
      try {
        const resp = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await resp.json();

        if (resp.ok) {
          setState("success");
          setTimeout(() => router.push("/dashboard"), 3000);
        } else {
          setState("error");
          setErrorMessage(data.detail ?? "Verification failed.");
        }
      } catch {
        setState("error");
        setErrorMessage("Something went wrong. Please try again.");
      }
    };

    verify();
  }, [token, router]);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    if (!resendEmail || resendSending || cooldown > 0) return;

    setResendSending(true);
    setResendError("");

    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });
      // Always treat as success — endpoint is enumeration-safe
      setResendDone(true);
      startCooldown();
    } catch {
      setResendError("Something went wrong. Please try again.");
    } finally {
      setResendSending(false);
    }
  }

  if (state === "loading") {
    return (
      <div className="text-center space-y-4">
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto">
          <svg className="animate-spin w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <p className="text-slate-600">Verifying your email…</p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 bg-jade/10 rounded-2xl flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-jade" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Email verified!</h2>
        <p className="text-sm text-slate-500">
          You can now earn XP and badges. Redirecting to your dashboard…
        </p>
        <Link
          href="/dashboard"
          className="inline-block text-sm text-indigo-600 font-semibold hover:text-indigo-700"
        >
          Go to dashboard now
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center space-y-5">
      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
        <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-slate-900">Verification failed</h2>
      <p className="text-sm text-slate-500">{errorMessage}</p>

      {resendDone ? (
        <div className="space-y-2">
          <p className="text-sm text-jade font-medium">
            New link sent — check your inbox.
          </p>
          {cooldown > 0 && (
            <p className="text-xs text-slate-400">
              Resend again in {cooldown}s
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={handleResend} className="space-y-3 text-left">
          <label className="block text-sm font-medium text-slate-700">
            Email address
            <input
              type="email"
              required
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          {resendError && (
            <p className="text-xs text-red-500">{resendError}</p>
          )}
          <Button
            type="submit"
            variant="secondary"
            disabled={resendSending || cooldown > 0}
            className="w-full"
          >
            {resendSending
              ? "Sending…"
              : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Request new link"}
          </Button>
        </form>
      )}
    </div>
  );
}
