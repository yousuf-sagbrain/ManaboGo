import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Create account" };

function BrandMark() {
  return (
    <div style={{ textAlign: "center", marginBottom: 28 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "var(--font-jp)", fontSize: 18, fontWeight: 700, color: "#fff" }}>学</span>
        </div>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--ink)", letterSpacing: "-0.2px" }}>
          ManaboGo
        </span>
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.09em", textTransform: "uppercase" }}>
        JLPT N5
      </div>
    </div>
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
      <path d="M15.035 9.548c-.02-1.9 1.554-2.816 1.624-2.86-1.584-1.966-3.586-2.014-3.586-2.014-1.51-.154-2.969.9-3.737.9-.768 0-1.94-.882-3.194-.857-1.632.024-3.143.953-3.98 2.41C.39 9.86 1.623 14.26 3.34 16.676c.865 1.185 1.887 2.513 3.228 2.465 1.302-.051 1.79-.84 3.36-.84 1.572 0 2.02.84 3.385.815 1.4-.024 2.282-1.204 3.136-2.395.994-1.37 1.399-2.7 1.42-2.769-.032-.015-2.816-1.08-2.834-4.404zM12.14 3.036C12.83 2.19 13.3 1.03 13.167 0c-.975.04-2.154.649-2.852 1.493-.626.734-1.177 1.91-1.028 3.034 1.088.083 2.198-.554 2.853-1.491z" fill="var(--ink)" />
    </svg>
  );
}

function LineIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect width="18" height="18" rx="4" fill="#06C755" />
      <path d="M15 7.8C15 5.15 12.31 3 9 3S3 5.15 3 7.8c0 2.37 2.1 4.36 4.94 4.73.19.04.45.13.52.3.06.15.04.39.02.54l-.08.5c-.02.15-.12.57.5.31.62-.26 3.35-1.97 4.57-3.38A4.3 4.3 0 0015 7.8z" fill="white" />
    </svg>
  );
}

export default function RegisterPage() {
  return (
    <>
      <BrandMark />

      <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--ink)", textAlign: "center", margin: "0 0 6px 0" }}>
        Create your account
      </h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ink-muted)", textAlign: "center", margin: "0 0 28px 0" }}>
        Start your JLPT N5 journey — it&apos;s free
      </p>

      <RegisterForm />

      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0" }}>
        <div style={{ flex: 1, height: 1, background: "var(--border-soft)" }} />
        <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ink-subtle)", whiteSpace: "nowrap" }}>or continue with</span>
        <div style={{ flex: 1, height: 1, background: "var(--border-soft)" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {([
          { label: "Google", Icon: GoogleIcon },
          { label: "Apple",  Icon: AppleIcon  },
          { label: "LINE",   Icon: LineIcon   },
        ] as const).map(({ label, Icon }) => (
          <button key={label} type="button" className="social-btn">
            <Icon />
            Continue with {label}
          </button>
        ))}
      </div>

      <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ink-subtle)", textAlign: "center", marginTop: 22, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--sage)" }} />
        Used by 12,400+ N5 learners across SEA
      </p>
    </>
  );
}
