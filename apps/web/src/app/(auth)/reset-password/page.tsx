import { Suspense } from "react";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900 mb-6 font-display">
        Reset your password
      </h1>
      <Suspense
        fallback={<div className="text-center text-slate-500 text-sm">Loading…</div>}
      >
        <ResetPasswordForm />
      </Suspense>
    </>
  );
}
