import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create account",
};

function SakuraMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <ellipse
          key={i}
          cx="20"
          cy="10"
          rx="7"
          ry="10"
          fill="var(--sakura)"
          opacity="0.85"
          transform={`rotate(${deg} 20 20)`}
        />
      ))}
      <circle cx="20" cy="20" r="4" fill="#FFD166" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M15.035 9.548c-.02-1.9 1.554-2.816 1.624-2.86-1.584-1.966-3.586-2.014-3.586-2.014-1.51-.154-2.969.9-3.737.9-.768 0-1.94-.882-3.194-.857-1.632.024-3.143.953-3.98 2.41C.39 9.86 1.623 14.26 3.34 16.676c.865 1.185 1.887 2.513 3.228 2.465 1.302-.051 1.79-.84 3.36-.84 1.572 0 2.02.84 3.385.815 1.4-.024 2.282-1.204 3.136-2.395.994-1.37 1.399-2.7 1.42-2.769-.032-.015-2.816-1.08-2.834-4.404zM12.14 3.036C12.83 2.19 13.3 1.03 13.167 0c-.975.04-2.154.649-2.852 1.493-.626.734-1.177 1.91-1.028 3.034 1.088.083 2.198-.554 2.853-1.491z" fill="#1A1F3C" />
    </svg>
  );
}

function LineIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect width="18" height="18" rx="4" fill="#06C755" />
      <path d="M15 7.8C15 5.15 12.31 3 9 3S3 5.15 3 7.8c0 2.37 2.1 4.36 4.94 4.73.19.04.45.13.52.3.06.15.04.39.02.54l-.08.5c-.02.15-.12.57.5.31.62-.26 3.35-1.97 4.57-3.38A4.3 4.3 0 0015 7.8z" fill="white" />
      <path d="M7.42 6.6H6.9a.15.15 0 00-.15.15v3.24c0 .08.07.15.15.15h.52c.08 0 .15-.07.15-.15V6.75a.15.15 0 00-.15-.15zM11.1 6.6h-.52a.15.15 0 00-.15.15v1.92L9.13 6.69a.15.15 0 00-.03-.04l-.01-.01-.01-.01H8.58a.15.15 0 00-.15.15v3.24c0 .08.07.15.15.15h.52c.08 0 .15-.07.15-.15V8.1l1.31 1.95c.03.04.07.07.11.07h.53c.08 0 .15-.07.15-.15V6.75a.15.15 0 00-.15-.15z" fill="#06C755" />
    </svg>
  );
}

export default function RegisterPage() {
  return (
    <>
      {/* Brand */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <SakuraMark size={32} />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "22px",
              color: "var(--ink)",
              letterSpacing: "-0.3px",
            }}
          >
            ManaboGo
          </span>
        </div>
        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--sakura)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          JLPT N5
        </div>
      </div>

      {/* Heading */}
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "24px",
          color: "var(--ink)",
          textAlign: "center",
          margin: "0 0 6px 0",
        }}
      >
        Create your account
      </h1>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: "var(--muted)",
          textAlign: "center",
          margin: "0 0 24px 0",
        }}
      >
        Start your JLPT N5 journey free
      </p>

      {/* Form (fields, submit button, strength bar, sign-in link all inside) */}
      <RegisterForm />

      {/* Divider */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          margin: "20px 0",
        }}
      >
        <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            color: "var(--muted)",
            whiteSpace: "nowrap",
          }}
        >
          or continue with
        </span>
        <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
      </div>

      {/* Social buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {[
          { label: "Google", Icon: GoogleIcon },
          { label: "Apple", Icon: AppleIcon },
          { label: "LINE", Icon: LineIcon },
        ].map(({ label, Icon }) => (
          <button
            key={label}
            type="button"
            className="social-btn"
          >
            <Icon />
            Continue with {label}
          </button>
        ))}
      </div>

      {/* Trust note */}
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "12px",
          color: "var(--muted)",
          textAlign: "center",
          marginTop: "20px",
        }}
      >
        <span style={{ color: "var(--mint)", marginRight: "6px" }}>●</span>
        Used by 12,400+ N5 learners across SEA
      </p>
    </>
  );
}
