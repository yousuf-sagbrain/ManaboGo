"use client";

import { useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { useAuthStore } from "@/store/authStore";

// ─── Design tokens (mapped to CSS vars) ─────────────────────────────────────
const T = {
  sakura: "var(--sakura)",
  ink: "var(--ink)",
  page: "var(--page)",
  surface: "var(--surface)",
  surface2: "var(--surface-2)",
  border: "var(--border)",
  muted: "var(--muted)",
  mutedSoft: "var(--muted-soft)",
  mint: "var(--mint)",
  mintSoft: "var(--mint-soft)",
  tintMint: "var(--tint-mint)",
  gold: "var(--gold)",
  tintGold: "var(--tint-gold)",
  indigo: "var(--indigo)",
  tintIndigo: "var(--tint-indigo)",
  danger: "var(--danger)",
  tintSakura: "var(--tint-sakura)",
  fontDisplay: "var(--font-display)",
  fontBody: "var(--font-body)",
  fontJp: "var(--font-jp)",
} as const;

// ─── Kanji grid data ──────────────────────────────────────────────────────────
type KanjiStatus = "mature" | "learning" | "lapsed" | "unseen";
const KANJI_LIST: { char: string; status: KanjiStatus }[] = [
  { char: "一", status: "mature" },
  { char: "二", status: "mature" },
  { char: "三", status: "mature" },
  { char: "四", status: "mature" },
  { char: "五", status: "mature" },
  { char: "六", status: "mature" },
  { char: "七", status: "mature" },
  { char: "八", status: "mature" },
  { char: "九", status: "mature" },
  { char: "十", status: "mature" },
  { char: "日", status: "mature" },
  { char: "月", status: "mature" },
  { char: "火", status: "mature" },
  { char: "水", status: "mature" },
  { char: "木", status: "mature" },
  { char: "金", status: "mature" },
  { char: "土", status: "mature" },
  { char: "山", status: "mature" },
  { char: "川", status: "mature" },
  { char: "田", status: "mature" },
  { char: "人", status: "learning" },
  { char: "子", status: "learning" },
  { char: "女", status: "learning" },
  { char: "男", status: "learning" },
  { char: "見", status: "learning" },
  { char: "行", status: "learning" },
  { char: "食", status: "learning" },
  { char: "飲", status: "lapsed" },
  { char: "来", status: "lapsed" },
  { char: "言", status: "lapsed" },
  { char: "聞", status: "lapsed" },
  { char: "読", status: "lapsed" },
  { char: "書", status: "lapsed" },
  { char: "話", status: "unseen" },
  { char: "買", status: "unseen" },
  { char: "今", status: "unseen" },
  { char: "何", status: "unseen" },
  { char: "上", status: "unseen" },
  { char: "下", status: "unseen" },
  { char: "中", status: "unseen" },
  { char: "大", status: "unseen" },
  { char: "小", status: "unseen" },
  { char: "出", status: "unseen" },
  { char: "入", status: "unseen" },
  { char: "新", status: "unseen" },
  { char: "古", status: "unseen" },
  { char: "高", status: "unseen" },
  { char: "安", status: "unseen" },
  { char: "白", status: "unseen" },
  { char: "雨", status: "unseen" },
  { char: "天", status: "unseen" },
  // fill to 100 with placeholders
  ...Array.from({ length: 47 }, () => ({
    char: "ー",
    status: "unseen" as KanjiStatus,
  })),
];
const KANJI_COLOR: Record<KanjiStatus, string> = {
  mature: "var(--mint)",
  learning: "#C8F7E4",
  lapsed: "var(--sakura)",
  unseen: "#F0F0F0",
};

// ─── Focus rows data ──────────────────────────────────────────────────────────
const FOCUS_ROWS = [
  { title: "て-form verbs", accuracy: 52, delta: -8, queued: 14 },
  { title: "い-adjectives", accuracy: 61, delta: +3, queued: 9 },
  { title: "Particle usage", accuracy: 44, delta: -12, queued: 21 },
];

// ─── Shared card style ────────────────────────────────────────────────────────
const card = (extra?: React.CSSProperties): React.CSSProperties => ({
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: 16,
  padding: "20px 22px",
  ...extra,
});

// ─── Pulsing dot ──────────────────────────────────────────────────────────────
function PulsingDot() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: T.sakura,
        animation: "pulse 2s ease-in-out infinite",
        flexShrink: 0,
      }}
    />
  );
}

// ─── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={on}
      style={{
        position: "relative",
        width: 46,
        height: 26,
        borderRadius: 13,
        background: on ? T.mint : T.border,
        border: "none",
        cursor: "pointer",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: on ? 23 : 3,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}

// ─── SVG Ring ─────────────────────────────────────────────────────────────────
function Ring({ pct }: { pct: number }) {
  const r = 50;
  const cx = 60;
  const cy = 60;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <svg width={120} height={120} viewBox="0 0 120 120">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={T.tintIndigo}
        strokeWidth={10}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={T.indigo}
        strokeWidth={10}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    </svg>
  );
}

// ─── Retention SVG chart ───────────────────────────────────────────────────────
function RetentionChart() {
  // Points rising from 38% to 74% over 7 days
  const points = [38, 45, 51, 58, 63, 69, 74];
  const w = 260;
  const h = 110;
  const pad = { top: 10, right: 10, bottom: 20, left: 28 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;
  const minY = 30;
  const maxY = 80;

  const toX = (i: number) => pad.left + (i / (points.length - 1)) * innerW;
  const toY = (v: number) =>
    pad.top + innerH - ((v - minY) / (maxY - minY)) * innerH;

  const polyline = points
    .map((v, i) => `${toX(i)},${toY(v)}`)
    .join(" ");

  // 70% dashed line
  const dashY = toY(70);

  return (
    <svg width={w} height={h} style={{ display: "block", overflow: "visible" }}>
      {/* grid lines */}
      {[40, 50, 60, 70, 80].map((v) => (
        <line
          key={v}
          x1={pad.left}
          y1={toY(v)}
          x2={pad.left + innerW}
          y2={toY(v)}
          stroke={T.border}
          strokeWidth={1}
        />
      ))}
      {/* 70% target dashed */}
      <line
        x1={pad.left}
        y1={dashY}
        x2={pad.left + innerW}
        y2={dashY}
        stroke={T.danger}
        strokeWidth={1.5}
        strokeDasharray="4 3"
        opacity={0.6}
      />
      {/* gradient fill under line */}
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={T.indigo} stopOpacity={0.18} />
          <stop offset="100%" stopColor={T.indigo} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon
        points={`${toX(0)},${toY(minY)} ${polyline} ${toX(points.length - 1)},${toY(minY)}`}
        fill="url(#rg)"
      />
      {/* line */}
      <polyline
        points={polyline}
        fill="none"
        stroke={T.indigo}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* dots */}
      {points.map((v, i) => (
        <circle
          key={i}
          cx={toX(i)}
          cy={toY(v)}
          r={3}
          fill={T.indigo}
        />
      ))}
      {/* y-axis labels */}
      {[40, 60, 80].map((v) => (
        <text
          key={v}
          x={pad.left - 4}
          y={toY(v) + 4}
          textAnchor="end"
          fontSize={9}
          fill={T.mutedSoft}
        >
          {v}%
        </text>
      ))}
      {/* x-axis labels */}
      {["D1", "D2", "D3", "D4", "D5", "D6", "D7"].map((label, i) => (
        <text
          key={label}
          x={toX(i)}
          y={h - 4}
          textAnchor="middle"
          fontSize={9}
          fill={T.mutedSoft}
        >
          {label}
        </text>
      ))}
    </svg>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function Bar({
  pct,
  color,
  height = 8,
  bg,
}: {
  pct: number;
  color: string;
  height?: number;
  bg?: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height,
        borderRadius: height / 2,
        background: bg ?? T.surface2,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          borderRadius: height / 2,
          background: color,
          transition: "width 0.4s ease",
        }}
      />
    </div>
  );
}

// ─── Focus row ────────────────────────────────────────────────────────────────
function FocusRow({
  title,
  accuracy,
  delta,
  queued,
}: {
  title: string;
  accuracy: number;
  delta: number;
  queued: number;
}) {
  const isPositive = delta >= 0;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: T.fontBody,
            fontSize: 14,
            fontWeight: 600,
            color: T.ink,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 3,
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: T.muted,
              fontFamily: T.fontBody,
            }}
          >
            {accuracy}% accuracy
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: isPositive ? T.mint : T.danger,
              fontFamily: T.fontBody,
            }}
          >
            {isPositive ? "+" : ""}
            {delta}%
          </span>
          <span
            style={{
              fontSize: 11,
              color: T.mutedSoft,
              fontFamily: T.fontBody,
            }}
          >
            {queued} cards
          </span>
        </div>
      </div>
      <button
        style={{
          padding: "6px 13px",
          borderRadius: 8,
          border: `1.5px solid ${T.sakura}`,
          background: T.tintSakura,
          color: T.sakura,
          fontSize: 12,
          fontWeight: 700,
          fontFamily: T.fontBody,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Practice →
      </button>
    </div>
  );
}

// ─── Wifi icon ────────────────────────────────────────────────────────────────
function WifiIcon({ color }: { color: string }) {
  return (
    <svg width={28} height={22} viewBox="0 0 28 22" fill="none">
      <path
        d="M14 17.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"
        fill={color}
      />
      <path
        d="M8.2 13.3a8.2 8.2 0 0 1 11.6 0"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M3.5 8.8a14 14 0 0 1 21 0"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
        opacity={0.5}
      />
    </svg>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProDashboardPage() {
  const [offlineOn, setOfflineOn] = useState(true);
  const { stats, loading } = useDashboard();
  const user = useAuthStore((s) => s.user);

  const firstName =
    user?.fullName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";
  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : (user?.email?.[0] ?? "U").toUpperCase();

  return (
    <>
      {/* Pulse keyframe injected once */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(1.3); }
        }
      `}</style>

      {/* ── TopBar ───────────────────────────────────────────────────── */}
      <div
        style={{
          height: 60,
          background: T.ink,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingInline: 32,
          gap: 14,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        {/* Bell */}
        <button
          aria-label="Notifications"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "none",
            borderRadius: 10,
            width: 36,
            height: 36,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        {/* Avatar + PRO badge */}
        <div style={{ position: "relative", display: "inline-flex" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#7C3AED,#3B82F6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontFamily: T.fontDisplay,
              fontWeight: 700,
              fontSize: 15,
              userSelect: "none",
            }}
          >
            {initials}
          </div>
          <span
            style={{
              position: "absolute",
              bottom: -4,
              right: -6,
              background: T.sakura,
              color: "#fff",
              fontSize: 8,
              fontWeight: 800,
              fontFamily: T.fontBody,
              borderRadius: 4,
              padding: "1px 4px",
              letterSpacing: "0.04em",
              border: `1.5px solid ${T.ink}`,
            }}
          >
            PRO
          </span>
        </div>
      </div>

      {/* ── Content area ─────────────────────────────────────────────── */}
      <div
        style={{
          padding: "24px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          maxWidth: 1100,
          margin: "0 auto",
          fontFamily: T.fontBody,
        }}
      >
        {/* ── Exam Prep Banner ─────────────────────────────────────── */}
        <div
          style={{
            background: `linear-gradient(120deg, #1A1F3C 60%, #22295a 100%)`,
            borderRadius: 20,
            padding: "20px 24px",
            color: "#fff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            {/* Left */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <PulsingDot />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    color: T.sakura,
                    fontFamily: T.fontBody,
                    textTransform: "uppercase",
                  }}
                >
                  Exam Prep Mode Active
                </span>
              </div>
              <h2
                style={{
                  margin: 0,
                  fontFamily: T.fontDisplay,
                  fontSize: 26,
                  fontWeight: 800,
                  lineHeight: 1.2,
                  color: "#fff",
                }}
              >
                Exam in{" "}
                <span style={{ color: T.sakura }}>24 days</span>
              </h2>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.55)",
                  fontFamily: T.fontBody,
                }}
              >
                Sat 21 June, Tokyo — focused study plan active
              </p>
            </div>

            {/* Right metrics */}
            <div
              style={{
                display: "flex",
                gap: 24,
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              {[
                { label: "Pass probability", value: "74%" },
                { label: "Daily target", value: "50 cards" },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      fontFamily: T.fontDisplay,
                      color: "#fff",
                    }}
                  >
                    {value}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.5)",
                      fontFamily: T.fontBody,
                      marginTop: 2,
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 18 }}>
            <div
              style={{
                width: "100%",
                height: 4,
                borderRadius: 2,
                background: "rgba(255,255,255,0.12)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "73%",
                  height: "100%",
                  borderRadius: 2,
                  background: T.sakura,
                }}
              />
            </div>
            <div
              style={{
                marginTop: 5,
                fontSize: 10,
                color: "rgba(255,255,255,0.4)",
                fontFamily: T.fontBody,
              }}
            >
              73% of study plan complete
            </div>
          </div>
        </div>

        {/* ── Greeting ─────────────────────────────────────────────── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1
              style={{
                margin: 0,
                fontFamily: T.fontDisplay,
                fontSize: 28,
                fontWeight: 800,
                color: T.ink,
              }}
            >
              Welcome back, {firstName}
            </h1>
            <span
              style={{
                background: T.sakura,
                color: "#fff",
                fontSize: 11,
                fontWeight: 800,
                fontFamily: T.fontBody,
                borderRadius: 6,
                padding: "3px 8px",
                letterSpacing: "0.05em",
              }}
            >
              PRO
            </span>
          </div>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 14,
              color: T.muted,
              fontFamily: T.fontBody,
            }}
          >
            You&apos;re tracking ahead of cohort.
          </p>
        </div>

        {/* ── Stats row ────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
          }}
        >
          {[
            {
              label: "Day streak",
              value: loading ? "—" : String(stats?.day_streak ?? 0),
              unit: "🔥",
              color: T.gold,
              bg: T.tintGold,
            },
            {
              label: "Sakura coins",
              value: loading ? "—" : (stats?.sakura_coins ?? 0).toLocaleString(),
              unit: "✿",
              color: T.sakura,
              bg: T.tintSakura,
            },
            {
              label: "Vocab mastered",
              value: loading ? "—" : String(stats?.vocab_mastered ?? 0),
              unit: "",
              color: T.mint,
              bg: T.tintMint,
            },
            {
              label: "XP level",
              value: loading ? "—" : `Lv ${stats?.xp_level ?? 1}`,
              unit: "",
              color: T.indigo,
              bg: T.tintIndigo,
            },
          ].map(({ label, value, unit, color, bg }) => (
            <div
              key={label}
              style={{
                ...card(),
                display: "flex",
                flexDirection: "column",
                gap: 4,
                background: bg,
                border: "none",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: T.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  fontFamily: T.fontBody,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  fontFamily: T.fontDisplay,
                  color,
                  lineHeight: 1.1,
                }}
              >
                {value}
                {unit && (
                  <span style={{ fontSize: 18, marginLeft: 4 }}>{unit}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Two-col: Lesson CTA + Pass probability ────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr",
            gap: 14,
          }}
        >
          {/* Lesson CTA */}
          <div style={card({ display: "flex", flexDirection: "column", gap: 14 })}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 4,
                    fontFamily: T.fontBody,
                  }}
                >
                  Today&apos;s Lesson
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    fontFamily: T.fontDisplay,
                    color: T.ink,
                  }}
                >
                  Grammar · て-form review
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: T.muted,
                    marginTop: 4,
                    fontFamily: T.fontBody,
                  }}
                >
                  28 cards · ~12 min · Lapsed-heavy
                </div>
              </div>
              <span
                style={{
                  background: T.tintSakura,
                  color: T.sakura,
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: 8,
                  padding: "4px 10px",
                  fontFamily: T.fontBody,
                  whiteSpace: "nowrap",
                }}
              >
                22 / 50
              </span>
            </div>

            {/* Progress */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: T.muted,
                    fontFamily: T.fontBody,
                  }}
                >
                  Progress
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: T.sakura,
                    fontFamily: T.fontBody,
                  }}
                >
                  44%
                </span>
              </div>
              <Bar pct={44} color={T.sakura} height={10} />
            </div>

            <button
              style={{
                marginTop: 4,
                background: T.sakura,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "11px 0",
                fontSize: 15,
                fontWeight: 700,
                fontFamily: T.fontDisplay,
                cursor: "pointer",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLButtonElement).style.opacity = "0.88")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLButtonElement).style.opacity = "1")
              }
            >
              Continue Lesson →
            </button>
          </div>

          {/* Pass probability ring */}
          <div
            style={{
              ...card(),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: T.muted,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontFamily: T.fontBody,
                alignSelf: "flex-start",
              }}
            >
              Pass Probability
            </div>
            <div style={{ position: "relative", width: 120, height: 120 }}>
              <Ring pct={74} />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    fontFamily: T.fontDisplay,
                    color: T.indigo,
                    lineHeight: 1,
                  }}
                >
                  74%
                </span>
              </div>
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: T.mint,
                fontFamily: T.fontBody,
              }}
            >
              On track to pass
            </span>

            {/* Confidence interval bar */}
            <div style={{ width: "100%", marginTop: 4 }}>
              <div
                style={{
                  fontSize: 10,
                  color: T.mutedSoft,
                  marginBottom: 4,
                  fontFamily: T.fontBody,
                  textAlign: "center",
                }}
              >
                Confidence interval: 68% – 81%
              </div>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: 6,
                  borderRadius: 3,
                  background: T.tintIndigo,
                }}
              >
                {/* bar from 68% to 81% of 100% range = roughly 68–81 */}
                <div
                  style={{
                    position: "absolute",
                    left: "68%",
                    width: "13%",
                    height: "100%",
                    borderRadius: 3,
                    background: T.indigo,
                  }}
                />
                {/* tick at 74% */}
                <div
                  style={{
                    position: "absolute",
                    left: "74%",
                    top: -2,
                    width: 2,
                    height: 10,
                    borderRadius: 1,
                    background: T.indigo,
                    transform: "translateX(-50%)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-col: Section Mastery + Kanji Coverage ─────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 14,
          }}
        >
          {/* Section Mastery */}
          <div style={card({ display: "flex", flexDirection: "column", gap: 14 })}>
            <div
              style={{
                fontFamily: T.fontDisplay,
                fontSize: 16,
                fontWeight: 800,
                color: T.ink,
              }}
            >
              Section Mastery
            </div>
            {[
              { label: "Vocabulary", pct: 82, color: T.mint },
              { label: "Grammar", pct: 58, color: T.sakura },
              { label: "Reading", pct: 71, color: T.mint },
              { label: "Listening", pct: 64, color: T.sakura },
            ].map(({ label, pct, color }) => (
              <div key={label}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 5,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: T.ink,
                      fontFamily: T.fontBody,
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color,
                      fontFamily: T.fontBody,
                    }}
                  >
                    {pct}%
                  </span>
                </div>
                {/* bar with dashed 70% marker */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: 10,
                  }}
                >
                  <Bar pct={pct} color={color} height={10} />
                  {/* dashed danger line at 70% */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "70%",
                      width: 2,
                      height: "100%",
                      borderLeft: `2px dashed ${T.danger}`,
                      opacity: 0.7,
                    }}
                  />
                </div>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 2,
              }}
            >
              <div
                style={{
                  width: 18,
                  borderBottom: `2px dashed ${T.danger}`,
                  opacity: 0.7,
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  color: T.danger,
                  opacity: 0.7,
                  fontFamily: T.fontBody,
                }}
              >
                70% pass threshold
              </span>
            </div>
          </div>

          {/* Kanji Coverage */}
          <div style={card({ display: "flex", flexDirection: "column", gap: 12 })}>
            <div
              style={{
                fontFamily: T.fontDisplay,
                fontSize: 16,
                fontWeight: 800,
                color: T.ink,
              }}
            >
              Kanji Coverage
            </div>

            {/* 10×10 grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(10, 1fr)",
                gap: 3,
              }}
            >
              {KANJI_LIST.slice(0, 100).map((k, i) => (
                <div
                  key={i}
                  title={`${k.char} — ${k.status}`}
                  style={{
                    aspectRatio: "1",
                    background: KANJI_COLOR[k.status],
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontFamily: T.fontJp,
                    color:
                      k.status === "unseen" || k.status === "learning"
                        ? T.ink
                        : "#fff",
                    opacity: k.char === "ー" ? 0 : 1,
                    cursor: "default",
                  }}
                >
                  {k.char !== "ー" ? k.char : ""}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px 14px",
                marginTop: 2,
              }}
            >
              {[
                { label: "Mature", color: T.mint },
                { label: "Learning", color: "#C8F7E4" },
                { label: "Lapsed", color: T.sakura },
                { label: "Unseen", color: "#F0F0F0" },
              ].map(({ label, color }) => (
                <div
                  key={label}
                  style={{ display: "flex", alignItems: "center", gap: 5 }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: color,
                      border: `1px solid ${T.border}`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      color: T.muted,
                      fontFamily: T.fontBody,
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Two-col: Retention Curve + Recommended Focus ─────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.2fr",
            gap: 14,
          }}
        >
          {/* Retention Curve */}
          <div style={card({ display: "flex", flexDirection: "column", gap: 12 })}>
            <div
              style={{
                fontFamily: T.fontDisplay,
                fontSize: 16,
                fontWeight: 800,
                color: T.ink,
              }}
            >
              Retention Curve
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  fontFamily: T.fontDisplay,
                  color: T.indigo,
                }}
              >
                74%
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: T.mint,
                  fontWeight: 700,
                  fontFamily: T.fontBody,
                }}
              >
                +36pp from Day 1
              </span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <RetentionChart />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: -4,
              }}
            >
              <div
                style={{
                  width: 18,
                  borderBottom: `2px dashed ${T.danger}`,
                  opacity: 0.55,
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  color: T.danger,
                  opacity: 0.7,
                  fontFamily: T.fontBody,
                }}
              >
                70% target
              </span>
            </div>
          </div>

          {/* Recommended Focus */}
          <div style={card({ display: "flex", flexDirection: "column", gap: 4 })}>
            <div
              style={{
                fontFamily: T.fontDisplay,
                fontSize: 16,
                fontWeight: 800,
                color: T.ink,
                marginBottom: 6,
              }}
            >
              Recommended Focus
            </div>
            {FOCUS_ROWS.map((row) => (
              <FocusRow key={row.title} {...row} />
            ))}
            <div
              style={{
                marginTop: 10,
                padding: "10px 14px",
                background: T.tintMint,
                borderRadius: 10,
                fontSize: 12,
                color: T.mintSoft,
                fontFamily: T.fontBody,
                fontWeight: 600,
              }}
            >
              Tip: Tackle て-form today for the biggest pass-rate gain.
            </div>
          </div>
        </div>

        {/* ── Two-col: Offline toggle + Subscription ────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
          }}
        >
          {/* Offline toggle */}
          <div
            style={{
              ...card(),
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: offlineOn ? T.tintMint : T.surface2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.2s",
              }}
            >
              <WifiIcon color={offlineOn ? T.mint : T.mutedSoft} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: T.fontDisplay,
                  color: T.ink,
                }}
              >
                Offline Study
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: T.muted,
                  marginTop: 2,
                  fontFamily: T.fontBody,
                }}
              >
                7-day SRS cache
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 11,
                  color: offlineOn ? T.mint : T.mutedSoft,
                  fontWeight: 700,
                  fontFamily: T.fontBody,
                }}
              >
                {offlineOn ? "Enabled — synced just now" : "Disabled"}
              </div>
            </div>
            <Toggle
              on={offlineOn}
              onToggle={() => setOfflineOn((v) => !v)}
            />
          </div>

          {/* Subscription */}
          <div
            style={{
              ...card(),
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: T.tintSakura,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 24,
              }}
            >
              ✦
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: T.fontDisplay,
                  color: T.ink,
                }}
              >
                PRO · MONTHLY
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: T.muted,
                  marginTop: 2,
                  fontFamily: T.fontBody,
                }}
              >
                Renews 28 June 2026 · $4.99/mo
              </div>
            </div>
            <button
              style={{
                padding: "8px 14px",
                borderRadius: 9,
                border: `1.5px solid ${T.border}`,
                background: T.surface,
                color: T.muted,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: T.fontBody,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Manage
            </button>
          </div>
        </div>

        {/* bottom breathing room */}
        <div style={{ height: 32 }} />
      </div>
    </>
  );
}
