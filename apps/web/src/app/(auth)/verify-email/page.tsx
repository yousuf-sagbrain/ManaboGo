import { Suspense } from "react";
import type { Metadata } from "next";
import { VerifyEmailView } from "@/components/auth/VerifyEmailView";

export const metadata: Metadata = {
  title: "Verify email",
};

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center text-slate-500 text-sm">Verifying…</div>
      }
    >
      <VerifyEmailView />
    </Suspense>
  );
}
