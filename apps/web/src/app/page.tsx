import type { Metadata } from "next";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "ManaboGo — Learn Japanese for JLPT N5",
  description:
    "ManaboGo is the first platform offering an accredited online JLPT N5 certificate. Adaptive SRS, AI-powered readiness reports, and a global learner community.",
  openGraph: {
    title: "ManaboGo — Learn Japanese for JLPT N5",
    description: "Adaptive SRS · Readiness Reports · N5 Certification · Gamification. Start free today.",
    images: ["/og-home.png"],
  },
};

const FEATURES = [
  { kanji: "習", title: "Adaptive SRS",       desc: "Spaced repetition that adjusts to your forgetting curve — Kana, Kanji, Vocabulary, Grammar." },
  { kanji: "報", title: "Readiness Report",    desc: "5-component AI analysis of your N5 readiness. Know exactly where to focus next." },
  { kanji: "証", title: "N5 Certification",    desc: "The first platform offering an accredited online JLPT N5 certificate, verifiable by employers." },
  { kanji: "戦", title: "Vocab Battles",       desc: "Challenge friends in real-time battles, earn Sakura Coins, climb the leaderboard." },
];

const FREE_FEATURES = [
  "Kana + Basic Vocabulary SRS",
  "First 30 kanji characters",
  "1 Quick Mock per week",
  "10 Async Battles per week",
  "Progress tracking",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Unlimited SRS + all 103 kanji",
  "Unlimited Mock Tests",
  "Full 5-component Readiness Report",
  "N5 Certification attempt",
  "Real-time sync battles",
  "7-day offline mode",
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--base)", fontFamily: "var(--font-body)" }}>

      {/* Sticky header */}
      <header style={{ position: "sticky", top: 0, zIndex: 30, background: "var(--surface)", borderBottom: "1px solid var(--border-soft)", boxShadow: "var(--shadow-card)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>

          {/* Brand */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: "var(--font-jp)", fontSize: 17, fontWeight: 700, color: "#fff" }}>学</span>
            </div>
            <div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--ink)", display: "block", lineHeight: 1.1 }}>ManaboGo</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase" }}>JLPT N5</span>
            </div>
          </Link>

          {/* Nav — hidden on mobile */}
          <nav className="landing-nav" style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 14, fontWeight: 500, color: "var(--ink-muted)" }}>
            <Link href="/#features" style={{ color: "inherit", textDecoration: "none" }}>Features</Link>
            <Link href="/pricing"   style={{ color: "inherit", textDecoration: "none" }}>Pricing</Link>
            <Link href="/about"     style={{ color: "inherit", textDecoration: "none" }}>About</Link>
          </nav>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LanguageSwitcher />
            <Link href="/login" className="landing-sign-in" style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-muted)", textDecoration: "none", padding: "8px 12px", borderRadius: 10 }}>
              Sign in
            </Link>
            <Link
              href="/register"
              style={{ background: "var(--accent)", color: "#fff", padding: "9px 18px", borderRadius: 999, fontSize: 14, fontWeight: 600, textDecoration: "none", boxShadow: "0 2px 8px rgba(91,106,191,0.30)", whiteSpace: "nowrap" }}
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(52px, 10vw, 88px) 20px clamp(48px, 8vw, 72px)", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--accent-tint)", border: "1px solid var(--accent-ring)", borderRadius: 999, padding: "6px 16px", fontSize: 13, fontWeight: 600, color: "var(--accent)", marginBottom: 28 }}>
          <span>🏆</span> Now offering accredited JLPT N5 certificates
        </div>

        <h1 className="hero-h1" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(36px, 7vw, 62px)", lineHeight: 1.1, color: "var(--ink)", margin: "0 auto 18px", maxWidth: 620, letterSpacing: "-1px" }}>
          Learn Japanese.
          <br />
          <span style={{ color: "var(--accent)" }}>Earn your N5.</span>
        </h1>

        <p className="hero-sub" style={{ fontSize: "clamp(15px, 3vw, 17px)", lineHeight: 1.7, color: "var(--ink-muted)", maxWidth: 520, margin: "0 auto 36px" }}>
          Adaptive SRS, AI readiness reports, real-time vocabulary battles, and the first
          online-accredited N5 certificate — free to start.
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 36 }}>
          <Link
            href="/register"
            style={{ background: "var(--accent)", color: "#fff", padding: "14px 28px", borderRadius: 999, fontSize: 15, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 16px rgba(91,106,191,0.38)", whiteSpace: "nowrap" }}
          >
            Start Free — No Card
          </Link>
          <Link
            href="/pricing"
            style={{ background: "transparent", color: "var(--ink)", padding: "13px 24px", borderRadius: 999, fontSize: 15, fontWeight: 500, textDecoration: "none", border: "1.5px solid var(--border-strong)", whiteSpace: "nowrap" }}
          >
            See Pricing
          </Link>
        </div>

        <p style={{ fontSize: 13, color: "var(--ink-subtle)", fontWeight: 500 }}>
          12,400+ learners &nbsp;·&nbsp; 30+ countries &nbsp;·&nbsp; 2,100+ certificates
        </p>
      </section>

      {/* Stats strip — 3-col, collapses gracefully */}
      <section style={{ background: "var(--surface)", borderTop: "1px solid var(--border-soft)", borderBottom: "1px solid var(--border-soft)", padding: "36px 20px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px 8px", textAlign: "center" }}>
          {[
            { stat: "12,400+", label: "N5 Learners",        color: "var(--accent)" },
            { stat: "30+",     label: "Countries",           color: "var(--sage)"   },
            { stat: "2,100+",  label: "Certificates",        color: "var(--pro)"    },
          ].map(({ stat, label, color }) => (
            <div key={label}>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(26px, 5vw, 36px)", color, margin: "0 0 4px 0", letterSpacing: "-0.5px" }}>{stat}</p>
              <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: 0, fontWeight: 500 }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features — auto-fit grid, 2-col on tablet, 1-col on phone */}
      <section id="features" style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(48px, 8vw, 80px) 20px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(24px, 4vw, 32px)", color: "var(--ink)", textAlign: "center", marginBottom: 12, letterSpacing: "-0.5px" }}>
          Everything you need to pass N5
        </h2>
        <p style={{ textAlign: "center", color: "var(--ink-muted)", fontSize: 15, marginBottom: 40 }}>
          Mobile-first, offline-capable, available in 5 languages
        </p>
        <div className="grid-features">
          {FEATURES.map(({ kanji, title, desc }) => (
            <div key={title} style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 18, padding: "24px 22px", boxShadow: "var(--shadow-card)" }}>
              <div style={{ width: 48, height: 48, borderRadius: 13, background: "var(--accent-tint)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, fontFamily: "var(--font-jp)", fontSize: 22, color: "var(--accent)" }}>
                {kanji}
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--ink)", margin: "0 0 8px 0" }}>{title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--ink-muted)", margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing preview */}
      <section style={{ background: "var(--surface)", borderTop: "1px solid var(--border-soft)", borderBottom: "1px solid var(--border-soft)", padding: "clamp(48px, 8vw, 80px) 20px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(24px, 4vw, 32px)", color: "var(--ink)", marginBottom: 10, letterSpacing: "-0.5px" }}>
            Simple, transparent pricing
          </h2>
          <p style={{ fontSize: 15, color: "var(--ink-muted)", marginBottom: 44 }}>
            Start free forever. Upgrade for unlimited practice and certification.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, textAlign: "left" }}>

            {/* Free */}
            <div style={{ background: "var(--base)", border: "1px solid var(--border-soft)", borderRadius: 20, padding: "32px 28px" }}>
              <div className="label" style={{ marginBottom: 10 }}>Free</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 38, color: "var(--ink)", marginBottom: 4, letterSpacing: "-0.5px" }}>
                $0 <span style={{ fontSize: 15, fontWeight: 400, color: "var(--ink-muted)" }}>/month</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
                {FREE_FEATURES.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--ink-soft)" }}>
                    <span style={{ color: "var(--sage)", fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" style={{ display: "block", textAlign: "center", background: "var(--ink)", color: "#fff", borderRadius: 12, padding: "13px 0", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                Get started free
              </Link>
            </div>

            {/* Pro */}
            <div style={{ background: "var(--accent)", borderRadius: 20, padding: "32px 28px", color: "#fff", position: "relative", overflow: "hidden", boxShadow: "0 8px 32px rgba(91,106,191,0.35)" }}>
              <div style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.18)", borderRadius: 999, padding: "3px 11px", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "#fff" }}>
                POPULAR
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.8, marginBottom: 10 }}>Pro</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 38, marginBottom: 4, letterSpacing: "-0.5px" }}>
                $12 <span style={{ fontSize: 15, fontWeight: 400, opacity: 0.75 }}>/month</span>
              </div>
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 20 }}>Prices adjusted for your region (PPP)</div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
                {PRO_FEATURES.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#fff" }}>
                    <span style={{ fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register?plan=pro" style={{ display: "block", textAlign: "center", background: "#fff", color: "var(--accent)", borderRadius: 12, padding: "13px 0", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                Start 7-day free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: "var(--ink-subtle)", flexWrap: "wrap", gap: 12 }}>
        <p style={{ margin: 0 }}>© 2026 ManaboGo. All rights reserved.</p>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/about"   style={{ color: "inherit", textDecoration: "none" }}>About</Link>
          <Link href="/pricing" style={{ color: "inherit", textDecoration: "none" }}>Pricing</Link>
          <LanguageSwitcher />
        </div>
      </footer>
    </div>
  );
}
