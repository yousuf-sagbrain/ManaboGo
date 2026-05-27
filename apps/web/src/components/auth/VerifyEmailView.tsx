"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

type State = "loading" | "success" | "error";

export function VerifyEmailView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<State>("loading");
  const [errorMessage, setErrorMessage] = useState("");

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
          // Auto-redirect to dashboard after 3 seconds
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
    <div className="text-center space-y-4">
      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
        <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-slate-900">Verification failed</h2>
      <p className="text-sm text-slate-500">{errorMessage}</p>
      <Button
        variant="secondary"
        onClick={() => {
          // TODO Phase 4: implement resend verification email
          alert("Resend feature coming soon. Please contact support.");
        }}
      >
        Request new link
      </Button>
    </div>
  );
}
