"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SectionResult {
  name: string;
  score: number;
  total: number;
  color: string;
  trackColor: string;
}

interface WeakArea {
  topic: string;
  accuracy: number;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const SECTION_RESULTS: SectionResult[] = [
  { name: "Vocabulary", score: 52, total: 60, color: "var(--mint-soft)", trackColor: "var(--tint-mint)" },
  { name: "Grammar",    score: 38, total: 60, color: "var(--sakura)",    trackColor: "var(--tint-sakura)" },
  { name: "Listening",  score: 52, total: 60, color: "var(--mint-soft)", trackColor: "var(--tint-mint)" },
];

const WEAK_AREAS: WeakArea[] = [
  { topic: "Grammar · て-form", accuracy: 43 },
  { topic: "Particle usage",   accuracy: 51 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function PageHeader() {
  return (
    <div
      style={{
        height: 60,
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 18,
          color: "var(--ink)",
          letterSpacing: "-0.01em",
        }}
      >
        ManaboGo
      </span>
      <a
        href="/dashboard"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 14,
          color: "var(--muted)",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        ← Back to dashboard
      </a>
    </div>
  );
}

function HeroScore({ passed }: { passed: boolean }) {
  const score = 142;
  const total = 180;
  const pct = ((score / total) * 100).toFixed(1);

  return (
    <div
      style={{
        padding: "40px 32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        textAlign: "center",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        JLPT N5 Mock Examination
      </span>

      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 72,
          color: "var(--ink)",
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {score} <span style={{ fontSize: 36, color: "var(--muted-soft)", fontWeight: 700 }}>/ {total}</span>
      </div>

      {/* Pass / Fail badge */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 16px",
          borderRadius: 999,
          background: passed ? "var(--tint-mint)" : "var(--tint-red)",
          color: passed ? "var(--mint-soft)" : "var(--danger)",
          border: `1.5px solid ${passed ? "var(--mint-soft)" : "var(--danger)"}`,
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {passed ? "✓ PASS" : "✗ FAIL"}
      </span>

      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 24,
          color: "var(--ink)",
          margin: 0,
        }}
      >
        {passed ? "You passed!" : "Keep going!"}
      </h2>

      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 15,
          color: "var(--muted)",
        }}
      >
        {pct}% overall score
      </span>
    </div>
  );
}

function SectionCard({ section }: { section: SectionResult }) {
  const pct = Math.round((section.score / section.total) * 100);

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 15,
            color: "var(--ink)",
          }}
        >
          {section.name}
        </span>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 20,
            color: section.color,
          }}
        >
          {section.score}<span style={{ fontSize: 14, color: "var(--muted-soft)", fontWeight: 600 }}>/{section.total}</span>
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Progress bar */}
        <div
          style={{
            flex: 1,
            height: 8,
            borderRadius: 999,
            background: "var(--border)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              borderRadius: 999,
              background: section.color,
              transition: "width 0.5s ease",
            }}
          />
        </div>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            fontWeight: 600,
            color: section.color,
            minWidth: 36,
            textAlign: "right",
          }}
        >
          {pct}%
        </span>
      </div>
    </div>
  );
}

function SrsImpactCard() {
  return (
    <div
      style={{
        background: "var(--tint-gold)",
        border: "1px solid #F6D074",
        borderRadius: 16,
        padding: "18px 22px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <span style={{ fontSize: 26, flexShrink: 0 }}>📚</span>
      <div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 15,
            color: "#92400E",
            marginBottom: 3,
          }}
        >
          SRS queue updated
        </div>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "#92400E",
            opacity: 0.85,
          }}
        >
          +12 lapsed cards added to your review queue
        </div>
      </div>
    </div>
  );
}

function FocusPreviewCard({ areas }: { areas: WeakArea[] }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>🎯</span>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 15,
            color: "var(--ink)",
          }}
        >
          Focus Areas
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {areas.map((area) => (
          <div
            key={area.topic}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--ink)",
                fontWeight: 500,
              }}
            >
              {area.topic}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 80,
                  height: 6,
                  borderRadius: 999,
                  background: "var(--border)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${area.accuracy}%`,
                    borderRadius: 999,
                    background: "var(--danger)",
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--danger)",
                  minWidth: 34,
                  textAlign: "right",
                }}
              >
                {area.accuracy}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CertificateCta() {
  return (
    <div
      style={{
        background: "var(--sakura)",
        borderRadius: 16,
        padding: "24px 28px",
        display: "flex",
        alignItems: "center",
        gap: 18,
        flexWrap: "wrap",
      }}
    >
      {/* Certificate icon */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: "rgba(255,255,255,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          flexShrink: 0,
        }}
      >
        🎓
      </div>

      <div style={{ flex: 1, minWidth: 160 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 16,
            color: "#fff",
            marginBottom: 4,
          }}
        >
          You&apos;ve unlocked your N5 Certificate!
        </div>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "rgba(255,255,255,0.8)",
          }}
        >
          Proof of your JLPT N5 examination success
        </div>
      </div>

      <a
        href="/certificate"
        style={{
          background: "#fff",
          color: "var(--sakura)",
          border: "none",
          borderRadius: 12,
          padding: "11px 24px",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
          textDecoration: "none",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Download Certificate
      </a>
    </div>
  );
}

function ActionRow({ passed, onToggle }: { passed: boolean; onToggle: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 10,
        paddingTop: 8,
      }}
    >
      <button
        style={{
          background: "none",
          border: "1.5px solid var(--border)",
          borderRadius: 12,
          padding: "11px 22px",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 14,
          color: "var(--ink)",
          cursor: "pointer",
        }}
      >
        Review wrong answers
      </button>

      <button
        style={{
          background: "none",
          border: "1.5px solid var(--sakura)",
          borderRadius: 12,
          padding: "11px 22px",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 14,
          color: "var(--sakura)",
          cursor: "pointer",
        }}
      >
        Take another mock
      </button>

      {/* Dev toggle — pass/fail */}
      <button
        onClick={onToggle}
        style={{
          background: "none",
          border: "1.5px solid var(--border-soft)",
          borderRadius: 12,
          padding: "11px 22px",
          fontFamily: "var(--font-body)",
          fontSize: 13,
          color: "var(--muted)",
          cursor: "pointer",
          marginLeft: "auto",
        }}
      >
        Toggle: {passed ? "PASS" : "FAIL"}
      </button>

      <a
        href="/dashboard"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 14,
          color: "var(--muted)",
          textDecoration: "none",
        }}
      >
        ← Return to dashboard
      </a>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MockResultPage() {
  const [passed, setPassed] = useState(true);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--page)",
        overflow: "hidden",
      }}
    >
      <PageHeader />

      {/* Scrollable body */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 32px 40px",
        }}
      >
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Hero score */}
          <HeroScore passed={passed} />

          {/* Section results — 3-col grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 14,
            }}
          >
            {SECTION_RESULTS.map((section) => (
              <SectionCard key={section.name} section={section} />
            ))}
          </div>

          {/* SRS impact */}
          <SrsImpactCard />

          {/* Focus preview */}
          <FocusPreviewCard areas={WEAK_AREAS} />

          {/* Certificate CTA — only if passed */}
          {passed && <CertificateCta />}

          {/* Actions */}
          <ActionRow passed={passed} onToggle={() => setPassed((p) => !p)} />
        </div>
      </div>
    </div>
  );
}
