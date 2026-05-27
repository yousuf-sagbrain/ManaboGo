import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900 mb-6 font-display">
        Welcome back
      </h1>
      <LoginForm />
    </>
  );
}
