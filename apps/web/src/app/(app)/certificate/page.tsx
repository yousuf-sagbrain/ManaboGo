"use client";

import { useState } from "react";

// ─── SakuraMark SVG ───────────────────────────────────────────────────────────

const SakuraMark = ({ size = 22, color = "var(--sakura)" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    {[0, 72, 144, 216, 288].map((deg, i) => (
      <ellipse
        key={i}
        cx="20"
        cy="10"
        rx="7"
        ry="10"
        fill={color}
        opacity="0.85"
        transform={`rotate(${deg} 20 20)`}
      />
    ))}
    <circle cx="20" cy="20" r="4" fill="#FFD166" />
  </svg>
);

// ─── Seal SVG (bottom-right of certificate) ───────────────────────────────────

function SealSvg() {
  return (
    <svg width="70" height="70" viewBox="0 0 70 70" fill="none">
      {/* Outer ring */}
      <circle cx="35" cy="35" r="33" stroke="#E2E8F0" strokeWidth="2" fill="none" />
      <circle cx="35" cy="35" r="28" stroke="#CBD5E1" strokeWidth="1" fill="none" />
      {/* 5 petals */}
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <ellipse
          key={i}
          cx="35"
          cy="16"
          rx="5"
          ry="7"
          fill="var(--sakura)"
          opacity="0.5"
          transform={`rotate(${deg} 35 35)`}
        />
      ))}
      <circle cx="35" cy="35" r="4" fill="#FFD166" opacity="0.8" />
      {/* Text around ring — approximated as centered label */}
      <text
        x="35"
        y="52"
        textAnchor="middle"
        fontFamily="var(--font-mono), monospace"
        fontSize="6"
        fontWeight="700"
        fill="#64748B"
        letterSpacing="1"
      >
        N5 · 2026
      </text>
    </svg>
  );
}

// ─── Certificate watermark ────────────────────────────────────────────────────

function WatermarkFlower() {
  return (
    <svg
      width="220"
      height="220"
      viewBox="0 0 40 40"
      fill="none"
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        opacity: 0.07,
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <ellipse
          key={i}
          cx="20"
          cy="10"
          rx="7"
          ry="10"
          fill="var(--sakura)"
          transform={`rotate(${deg} 20 20)`}
        />
      ))}
      <circle cx="20" cy="20" r="4" fill="#FFD166" />
    </svg>
  );
}

// ─── Page header ──────────────────────────────────────────────────────────────

function PageHeader() {
  return (
    <div
      style={{
        height: 64,
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <SakuraMark size={26} />
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
      </div>

      <a
        href="/profile"
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
        ← Back to profile
      </a>
    </div>
  );
}

// ─── Certificate card ─────────────────────────────────────────────────────────

function CertificateCard() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 720,
        aspectRatio: "16 / 10",
        background: "var(--surface)",
        border: "1.5px solid var(--border)",
        borderRadius: 20,
        boxShadow:
          "0 4px 6px -1px rgba(0,0,0,0.07), 0 20px 60px -10px rgba(59,130,246,0.12)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top band */}
      <div
        style={{
          height: 64,
          background: "var(--ink)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <SakuraMark size={20} color="#fff" />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 15,
              color: "#fff",
              letterSpacing: "-0.01em",
            }}
          >
            ManaboGo
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 12,
            color: "rgba(255,255,255,0.7)",
            fontWeight: 500,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          N5 Certificate of Completion
        </span>
      </div>

      {/* Main area */}
      <div
        style={{
          flex: 1,
          background: "#fff",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 48px",
          overflow: "hidden",
        }}
      >
        {/* SVG Watermark */}
        <WatermarkFlower />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            position: "relative",
            zIndex: 1,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 11,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 600,
            }}
          >
            This certifies that
          </span>

          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 38,
              color: "var(--ink)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Yousuf Rahman
          </div>

          <div
            style={{
              width: 60,
              height: 2,
              background: "var(--sakura)",
              borderRadius: 999,
              margin: "2px 0",
            }}
          />

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--muted)",
              maxWidth: 380,
              margin: "0",
              lineHeight: 1.6,
            }}
          >
            has successfully completed the ManaboGo JLPT N5 Examination
          </p>

          {/* Score / Date / Result row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: 10,
            }}
          >
            {[
              { label: "SCORE", value: "142 / 180" },
              { label: "DATE", value: "26 May 2026" },
              { label: "RESULT", value: "PASS" },
            ].map(({ label, value }, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 10,
                      color: "var(--muted-soft)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: 2,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 13,
                      color: label === "RESULT" ? "var(--mint-soft)" : "var(--ink)",
                    }}
                  >
                    {value}
                  </div>
                </div>
                {i < 2 && (
                  <div
                    style={{
                      width: 1,
                      height: 28,
                      background: "var(--border)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Verification UUID */}
          <div
            style={{
              marginTop: 8,
              padding: "5px 14px",
              borderRadius: 6,
              background: "var(--surface-2)",
              border: "1px solid var(--border-soft)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono), JetBrains Mono, monospace",
                fontSize: 11,
                color: "var(--muted)",
                letterSpacing: "0.04em",
              }}
            >
              CERT-2026-A3F7-9D21
            </span>
          </div>
        </div>

        {/* Seal — bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            right: 24,
          }}
        >
          <SealSvg />
        </div>

        {/* Signature — bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 28,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div
            style={{
              width: 100,
              height: 1,
              background: "var(--border)",
            }}
          />
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 12,
              color: "var(--ink)",
              fontStyle: "italic",
            }}
          >
            Dr. Aiko Tanaka
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 10,
              color: "var(--muted)",
            }}
          >
            Chief Curriculum Officer
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div
        style={{
          height: 36,
          background: "var(--surface-2)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          flexShrink: 0,
          gap: 16,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono), JetBrains Mono, monospace",
            fontSize: 10,
            color: "var(--muted-soft)",
          }}
        >
          Verify at manabogo.app/verify/CERT-2026-A3F7-9D21
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono), JetBrains Mono, monospace",
            fontSize: 10,
            color: "var(--muted-soft)",
          }}
        >
          SHA-256: a4f2b8c1d7e93f02...
        </span>
      </div>
    </div>
  );
}

// ─── Action buttons ───────────────────────────────────────────────────────────

function ActionButtons() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText("https://manabogo.app/verify/CERT-2026-A3F7-9D21")
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
      <button
        style={{
          background: "var(--sakura)",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          padding: "12px 26px",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download PDF
      </button>

      <button
        onClick={handleCopy}
        style={{
          background: "none",
          border: "1.5px solid var(--border)",
          borderRadius: 12,
          padding: "12px 26px",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 14,
          color: "var(--ink)",
          cursor: "pointer",
        }}
      >
        {copied ? "✓ Copied!" : "Copy verification link"}
      </button>

      <button
        style={{
          background: "none",
          border: "1.5px solid var(--border)",
          borderRadius: 12,
          padding: "12px 26px",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 14,
          color: "var(--ink)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#0A66C2">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
        Share on LinkedIn
      </button>
    </div>
  );
}

// ─── Trust note ───────────────────────────────────────────────────────────────

function TrustNote() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        maxWidth: 480,
        textAlign: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ color: "var(--mint-soft)", flexShrink: 0, fontWeight: 700, fontSize: 15 }}>✓</span>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 13,
          color: "var(--muted)",
          margin: 0,
          lineHeight: 1.6,
        }}
      >
        This certificate can be independently verified by employers and institutions at{" "}
        <span style={{ color: "var(--sakura)", fontWeight: 600 }}>manabogo.app/verify</span>
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CertificatePage() {
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
          background: "linear-gradient(to bottom, var(--page) 0%, #E8F1FE 100%)",
        }}
      >
        <div
          style={{
            padding: "40px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          {/* Verified pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "6px 16px",
              borderRadius: 999,
              background: "var(--tint-mint)",
              border: "1.5px solid var(--mint-soft)",
              color: "var(--mint-soft)",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            <span style={{ fontWeight: 700 }}>✓</span>
            Verified · Issued 26 May 2026
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 34,
              color: "var(--ink)",
              margin: 0,
              textAlign: "center",
              letterSpacing: "-0.02em",
            }}
          >
            You&apos;re N5 certified.
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 15,
              color: "var(--muted)",
              margin: 0,
              textAlign: "center",
              maxWidth: 420,
              lineHeight: 1.6,
            }}
          >
            Your certificate includes a unique verification code that can be confirmed by employers and institutions.
          </p>

          {/* Certificate card */}
          <CertificateCard />

          {/* Action buttons */}
          <ActionButtons />

          {/* Trust note */}
          <TrustNote />

          {/* Bottom breathing room */}
          <div style={{ height: 16 }} />
        </div>
      </div>
    </div>
  );
}
