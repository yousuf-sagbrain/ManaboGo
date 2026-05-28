import type { Metadata } from "next";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "ManaboGo — Learn Japanese for JLPT N5",
  description:
    "ManaboGo is the first platform offering an accredited online JLPT N5 certificate. Adaptive SRS, AI-powered readiness reports, and a global learner community across 30+ countries.",
  openGraph: {
    title: "ManaboGo — Learn Japanese for JLPT N5",
    description:
      "Adaptive SRS · Readiness Reports · N5 Certification · Gamification. Start free today.",
    images: ["/og-home.png"],
  },
};

function SakuraMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
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

const features = [
  {
    emoji: "🧠",
    title: "Adaptive SRS",
    desc: "Spaced repetition that adjusts to your forgetting curve — Kana, Kanji, Vocabulary, Grammar.",
  },
  {
    emoji: "📊",
    title: "Readiness Report",
    desc: "5-component AI analysis of your N5 readiness. Know exactly where to focus.",
  },
  {
    emoji: "🏆",
    title: "N5 Certification",
    desc: "The first platform offering an accredited online JLPT N5 certificate, verifiable by employers.",
  },
  {
    emoji: "⚔️",
    title: "Gamification",
    desc: "Vocabulary battles, XP streaks, Sakura Coins, and a global leaderboard.",
  },
];

const freeFeatures = [
  "Kana + Basic Vocabulary SRS",
  "1 Quick Mock / week",
  "10 Async Battles / week",
  "Progress tracking",
];

const proFeatures = [
  "Everything in Free",
  "Unlimited SRS + Mocks",
  "Full Readiness Report",
  "Real-time sync battles",
  "N5 Certification attempt",
  "Offline mode",
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--page)", fontFamily: "var(--font-body)" }}>

      {/* Sticky header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "#fff",
          borderBottom: "1px solid #E8E8E4",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            maxWidth: 1152,
            margin: "0 auto",
            padding: "0 24px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* Brand */}
          <Link
            href="/"
            style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
          >
            <SakuraMark />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 18,
                  color: "var(--ink)",
                  letterSpacing: "-0.3px",
                }}
              >
                ManaboGo
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--sakura)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginTop: 1,
                }}
              >
                JLPT N5
              </span>
            </div>
          </Link>

          {/* Center nav — hidden on small screens via CSS media trick using max-width container */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
              fontSize: 14,
              fontWeight: 600,
              color: "var(--ink)",
            }}
            className="hidden-mobile-nav"
          >
            <Link href="/#features" style={{ color: "inherit", textDecoration: "none", opacity: 0.75 }}>
              Features
            </Link>
            <Link href="/pricing" style={{ color: "inherit", textDecoration: "none", opacity: 0.75 }}>
              Pricing
            </Link>
            <Link href="/about" style={{ color: "inherit", textDecoration: "none", opacity: 0.75 }}>
              About
            </Link>
          </nav>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <LanguageSwitcher />
            <Link
              href="/login"
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--ink)",
                textDecoration: "none",
                opacity: 0.75,
              }}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              style={{
                background: "var(--sakura)",
                color: "#fff",
                padding: "8px 20px",
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.1px",
                boxShadow: "0 2px 8px rgba(59,130,246,0.35)",
              }}
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        style={{
          maxWidth: 1152,
          margin: "0 auto",
          padding: "80px 24px 72px",
          textAlign: "center",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(59,130,246,0.08)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: 999,
            padding: "6px 16px",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--sakura)",
            marginBottom: 28,
          }}
        >
          🎌 Now offering accredited JLPT N5 certificates
        </div>

        {/* H1 */}
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(40px, 6vw, 64px)",
            lineHeight: 1.1,
            color: "var(--ink)",
            margin: "0 auto 20px",
            maxWidth: 640,
            letterSpacing: "-1px",
          }}
        >
          Learn Japanese.
          <br />
          <span style={{ color: "var(--sakura)" }}>Earn your N5.</span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.6,
            color: "var(--muted, #6B7280)",
            maxWidth: 560,
            margin: "0 auto 36px",
          }}
        >
          The world&apos;s most engaging JLPT N5 prep platform — with adaptive SRS,
          AI-powered readiness reports, real-time battles, and the first online-accredited
          N5 certificate.
        </p>

        {/* CTAs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            flexWrap: "wrap",
            marginBottom: 36,
          }}
        >
          <Link
            href="/register"
            style={{
              background: "var(--sakura)",
              color: "#fff",
              padding: "14px 32px",
              borderRadius: 999,
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              fontFamily: "var(--font-display)",
              boxShadow: "0 4px 14px rgba(59,130,246,0.4)",
              letterSpacing: "-0.2px",
            }}
          >
            Start Free — No Card Required
          </Link>
          <Link
            href="/pricing"
            style={{
              background: "transparent",
              color: "var(--ink)",
              padding: "13px 32px",
              borderRadius: 999,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
              border: "1.5px solid rgba(26,31,60,0.2)",
              letterSpacing: "-0.1px",
            }}
          >
            See Pricing
          </Link>
        </div>

        {/* Social proof line */}
        <p
          style={{
            fontSize: 13,
            color: "var(--muted, #9CA3AF)",
            fontWeight: 500,
            letterSpacing: "0.01em",
          }}
        >
          Used by 12,400+ N5 learners &nbsp;·&nbsp; 30+ countries &nbsp;·&nbsp; 2,100+ certificates
        </p>
      </section>

      {/* Stats strip */}
      <section
        style={{
          background: "#fff",
          borderTop: "1px solid #E8E8E4",
          borderBottom: "1px solid #E8E8E4",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1152,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            textAlign: "center",
          }}
        >
          {[
            { stat: "12,400+", label: "N5 Learners" },
            { stat: "30+", label: "Countries" },
            { stat: "2,100+", label: "Certificates Issued" },
          ].map(({ stat, label }) => (
            <div key={label}>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 34,
                  color: "var(--sakura)",
                  margin: 0,
                  letterSpacing: "-0.5px",
                }}
              >
                {stat}
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--muted, #9CA3AF)",
                  marginTop: 4,
                  fontWeight: 500,
                }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section
        id="features"
        style={{
          maxWidth: 1152,
          margin: "0 auto",
          padding: "80px 24px",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 32,
            color: "var(--ink)",
            textAlign: "center",
            marginBottom: 48,
            letterSpacing: "-0.5px",
          }}
        >
          Everything you need to pass JLPT N5
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
          }}
        >
          {features.map(({ emoji, title, desc }) => (
            <div
              key={title}
              style={{
                background: "#fff",
                border: "1px solid #E8E8E4",
                borderRadius: 16,
                padding: "28px 24px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>{emoji}</div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 16,
                  color: "var(--ink)",
                  marginBottom: 8,
                }}
              >
                {title}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted, #6B7280)", margin: 0 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing preview */}
      <section
        style={{
          background: "#fff",
          borderTop: "1px solid #E8E8E4",
          borderBottom: "1px solid #E8E8E4",
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 32,
              color: "var(--ink)",
              marginBottom: 12,
              letterSpacing: "-0.5px",
            }}
          >
            Simple pricing
          </h2>
          <p style={{ fontSize: 16, color: "var(--muted, #6B7280)", marginBottom: 48 }}>
            Start free forever. Upgrade when you need unlimited practice and N5 certification.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
              textAlign: "left",
            }}
          >
            {/* Free plan */}
            <div
              style={{
                background: "var(--page, #FAFAF9)",
                border: "1px solid #E8E8E4",
                borderRadius: 20,
                padding: "32px 28px",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--muted, #9CA3AF)",
                  marginBottom: 8,
                }}
              >
                Free
              </p>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 36,
                  color: "var(--ink)",
                  marginBottom: 4,
                  letterSpacing: "-0.5px",
                }}
              >
                $0{" "}
                <span
                  style={{ fontSize: 15, fontWeight: 400, color: "var(--muted, #9CA3AF)" }}
                >
                  / month
                </span>
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
                {freeFeatures.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--ink)", opacity: 0.8 }}>
                    <span style={{ color: "#22C55E", fontWeight: 700 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                style={{
                  display: "block",
                  textAlign: "center",
                  background: "var(--ink)",
                  color: "#fff",
                  borderRadius: 12,
                  padding: "12px 0",
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                  fontFamily: "var(--font-display)",
                }}
              >
                Get started free
              </Link>
            </div>

            {/* Pro plan */}
            <div
              style={{
                background: "var(--sakura)",
                borderRadius: 20,
                padding: "32px 28px",
                color: "#fff",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(59,130,246,0.35)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: 999,
                  padding: "4px 12px",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                }}
              >
                POPULAR
              </div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  opacity: 0.8,
                  marginBottom: 8,
                }}
              >
                Pro
              </p>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 36,
                  marginBottom: 4,
                  letterSpacing: "-0.5px",
                }}
              >
                $12{" "}
                <span style={{ fontSize: 15, fontWeight: 400, opacity: 0.75 }}>/ month</span>
              </p>
              <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 20 }}>
                Prices adjusted for your region (PPP)
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
                {proFeatures.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
                    <span style={{ fontWeight: 700 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register?plan=pro"
                style={{
                  display: "block",
                  textAlign: "center",
                  background: "#fff",
                  color: "var(--sakura)",
                  borderRadius: 12,
                  padding: "12px 0",
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                  fontFamily: "var(--font-display)",
                }}
              >
                Get Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          maxWidth: 1152,
          margin: "0 auto",
          padding: "36px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 13,
          color: "var(--muted, #9CA3AF)",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <p style={{ margin: 0 }}>© 2026 ManaboGo. All rights reserved.</p>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/about" style={{ color: "inherit", textDecoration: "none" }}>
            About
          </Link>
          <Link href="/pricing" style={{ color: "inherit", textDecoration: "none" }}>
            Pricing
          </Link>
          <LanguageSwitcher />
        </div>
      </footer>
    </div>
  );
}
