import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900 mb-6 font-display">
        Start learning Japanese
      </h1>
      <RegisterForm />
    </>
  );
}
