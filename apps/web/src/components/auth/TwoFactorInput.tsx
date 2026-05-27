"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface TwoFactorInputProps {
  onSubmit: (code: string) => void;
  isLoading?: boolean;
  error?: string;
}

export function TwoFactorInput({ onSubmit, isLoading, error }: TwoFactorInputProps) {
  const [code, setCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCodeChange = (value: string) => {
    const sanitized = useBackupCode
      ? value.toUpperCase().replace(/[^A-F0-9]/g, "").slice(0, 8)
      : value.replace(/\D/g, "").slice(0, 6);
    setCode(sanitized);

    // Auto-submit when full code entered
    if (!useBackupCode && sanitized.length === 6) {
      onSubmit(sanitized);
    }
    if (useBackupCode && sanitized.length === 8) {
      onSubmit(sanitized);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code) onSubmit(code);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Two-factor authentication</h2>
        <p className="text-sm text-slate-500 mt-1">
          {useBackupCode
            ? "Enter one of your 8-character backup codes."
            : "Enter the 6-digit code from your authenticator app."}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Input
        ref={inputRef}
        label={useBackupCode ? "Backup code" : "6-digit code"}
        type="text"
        inputMode={useBackupCode ? "text" : "numeric"}
        pattern={useBackupCode ? "[A-F0-9]{8}" : "[0-9]{6}"}
        value={code}
        onChange={(e) => handleCodeChange(e.target.value)}
        autoFocus
        placeholder={useBackupCode ? "XXXXXXXX" : "000000"}
        maxLength={useBackupCode ? 8 : 6}
        className="text-center text-xl tracking-widest font-mono"
        autoComplete="one-time-code"
      />

      <Button type="submit" fullWidth isLoading={isLoading} disabled={!code}>
        Verify
      </Button>

      <button
        type="button"
        onClick={() => {
          setUseBackupCode((v) => !v);
          setCode("");
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="w-full text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        {useBackupCode ? "Use authenticator app instead" : "Use a backup code instead"}
      </button>
    </form>
  );
}
