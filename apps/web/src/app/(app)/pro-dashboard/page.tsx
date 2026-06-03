"use client";

import { useState } from "react";
import Link from "next/link";
import { useDashboard } from "@/hooks/useDashboard";
import { useAuthStore } from "@/store/authStore";

// ── Kanji heatmap data ────────────────────────────────────────
type KanjiStatus = "mature" | "learning" | "lapsed" | "unseen";

const KANJI_LIST: { char: string; status: KanjiStatus }[] = [
  { char: "一", status: "mature" }, { char: "二", status: "mature" }, { char: "三", status: "mature" },
  { char: "四", status: "mature" }, { char: "五", status: "mature" }, { char: "六", status: "mature" },
  { char: "七", status: "mature" }, { char: "八", status: "mature" }, { char: "九", status: "mature" },
  { char: "十", status: "mature" }, { char: "日", status: "mature" }, { char: "月", status: "mature" },
  { char: "火", status: "mature" }, { char: "水", status: "mature" }, { char: "木", status: "mature" },
  { char: "金", status: "mature" }, { char: "土", status: "mature" }, { char: "山", status: "mature" },
  { char: "川", status: "mature" }, { char: "田", status: "mature" },
  { char: "人", status: "learning" }, { char: "子", status: "learning" }, { char: "女", status: "learning" },
  { char: "男", status: "learning" }, { char: "見", status: "learning" }, { char: "行", status: "learning" },
  { char: "食", status: "learning" },
  { char: "飲", status: "lapsed" }, { char: "来", status: "lapsed" }, { char: "言", status: "lapsed" },
  { char: "聞", status: "lapsed" }, { char: "読", status: "lapsed" }, { char: "書", status: "lapsed" },
  { char: "話", status: "unseen" }, { char: "買", status: "unseen" }, { char: "今", status: "unseen" },
  { char: "何", status: "unseen" }, { char: "上", status: "unseen" }, { char: "下", status: "unseen" },
  { char: "中", status: "unseen" }, { char: "大", status: "unseen" }, { char: "小", status: "unseen" },
  { char: "出", status: "unseen" }, { char: "入", status: "unseen" }, { char: "新", status: "unseen" },
  { char: "古", status: "unseen" }, { char: "高", status: "unseen" }, { char: "安", status: "unseen" },
  { char: "白", status: "unseen" }, { char: "雨", status: "unseen" }, { char: "天", status: "unseen" },
  ...Array.from({ length: 51 }, () => ({ char: "　", status: "unseen" as KanjiStatus })),
];

const KANJI_COLOR: Record<KanjiStatus, string> = {
  mature:   "var(--sage)",
  learning: "var(--sage-ring)",
  lapsed:   "var(--coral-ring)",
  unseen:   "var(--base-3)",
};

const FOCUS_ROWS = [
  { title: "て-form verbs",   accuracy: 52, delta: -8,  queued: 14 },
  { title: "い-adjectives",   accuracy: 61, delta: +3,  queued: 9  },
  { title: "Particle usage",  accuracy: 44, delta: -12, queued: 21 },
];

// ── Pass probability ring ─────────────────────────────────────
function PassRing({ pct }: { pct: number }) {
  const r = 52, cx = 64, cy = 64;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 70 ? "var(--sage)" : pct >= 50 ? "var(--accent)" : "var(--coral)";
  return (
    <svg width={128} height={128} viewBox="0 0 128 128">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--base-2)" strokeWidth={10} />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth={10}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dashoffset 0.6s var(--ease-spring)" }}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={22} fontWeight="700" fill="var(--ink)" fontFamily="var(--font-display)">
        {pct}%
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize={10} fill="var(--ink-muted)" fontFamily="var(--font-body)">
        pass prob.
      </text>
    </svg>
  );
}

// ── Retention mini chart ──────────────────────────────────────
function RetentionChart() {
  const points = [38, 45, 51, 58, 63, 69, 74];
  const w = 240, h = 96;
  const pad = { t: 8, r: 8, b: 18, l: 24 };
  const iW = w - pad.l - pad.r, iH = h - pad.t - pad.b;
  const minY = 30, maxY = 80;
  const toX = (i: number) => pad.l + (i / (points.length - 1)) * iW;
  const toY = (v: number) => pad.t + iH - ((v - minY) / (maxY - minY)) * iH;
  const polyline = points.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const dashY = toY(70);

  return (
    <svg width={w} height={h} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.18} />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
        </linearGradient>
      </defs>
      {[40, 55, 70].map((v) => (
        <line key={v} x1={pad.l} y1={toY(v)} x2={pad.l + iW} y2={toY(v)} stroke="var(--border-soft)" strokeWidth={1} />
      ))}
      <line x1={pad.l} y1={dashY} x2={pad.l + iW} y2={dashY} stroke="var(--coral)" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.5} />
      <polygon points={`${toX(0)},${toY(minY)} ${polyline} ${toX(points.length - 1)},${toY(minY)}`} fill="url(#retGrad)" />
      <polyline points={polyline} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((v, i) => (
        <circle key={i} cx={toX(i)} cy={toY(v)} r={2.5} fill="var(--accent)" />
      ))}
      {[40, 60, 80].map((v) => (
        <text key={v} x={pad.l - 3} y={toY(v) + 4} textAnchor="end" fontSize={8} fill="var(--ink-subtle)">{v}%</text>
      ))}
      {["D1","D2","D3","D4","D5","D6","D7"].map((l, i) => (
        <text key={l} x={toX(i)} y={h - 2} textAnchor="middle" fontSize={8} fill="var(--ink-subtle)">{l}</text>
      ))}
    </svg>
  );
}

// ── Toggle ────────────────────────────────────────────────────
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} aria-pressed={on}
      style={{ position: "relative", width: 44, height: 24, borderRadius: 12, background: on ? "var(--sage)" : "var(--border)", border: "none", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}
    >
      <span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.18)", transition: "left 0.2s" }} />
    </button>
  );
}

// ── Section mastery trend bars ────────────────────────────────
const SECTIONS = [
  { label: "Vocabulary",  pct: 72, prev: 66 },
  { label: "Grammar",     pct: 58, prev: 61 },
  { label: "Reading",     pct: 64, prev: 54 },
  { label: "Listening",   pct: 51, prev: 49 },
];

// ── Page ──────────────────────────────────────────────────────
export default function ProDashboardPage() {
  const [offlineOn, setOfflineOn] = useState(false);
  const user = useAuthStore((s) => s.user);
  const { stats, totalDue, loading } = useDashboard();

  const firstName = user?.fullName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";
  const passProb  = 74;

  const cardStyle: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid var(--border-soft)",
    borderRadius: 20,
    padding: "22px 24px",
    boxShadow: "var(--shadow-card)",
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "var(--base)" }}>
      <div className="page-pad" style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1100, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>

        {/* Exam Prep Banner */}
        <div style={{ background: "linear-gradient(135deg, var(--pro-tint) 0%, #FEF8EC 100%)", border: "1.5px solid var(--pro-ring)", borderRadius: 20, padding: "20px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="label" style={{ color: "var(--pro)", marginBottom: 6 }}>✦ Exam Prep Mode · Pro</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(18px, 4vw, 22px)", color: "var(--ink)", margin: "0 0 5px 0" }}>
              You&apos;re 74% ready for N5
            </h2>
            <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: 0 }}>
              Cert exam unlocks at 70%. Focus on Grammar to close the gap.
            </p>
          </div>
          <Link href="/certificate" className="btn btn-pro" style={{ borderRadius: 12, fontSize: 14, flexShrink: 0 }}>
            Take Exam →
          </Link>
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(22px, 5vw, 28px)", color: "var(--ink)", margin: "0 0 4px 0" }}>
              Welcome back, {firstName}
            </h1>
            <p style={{ fontSize: 14, color: "var(--ink-muted)", margin: 0 }}>
              {totalDue > 0 ? `${totalDue} cards due for review.` : "All caught up — great consistency!"}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span className="pill pill-pro" style={{ fontSize: 11, height: 26, padding: "0 12px" }}>✦ Pro</span>
            <div style={{ background: "var(--accent-tint)", border: "1px solid var(--accent-ring)", borderRadius: 999, padding: "6px 14px", fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
              N5 · Lv {stats?.xp_level ?? 1}
            </div>
          </div>
        </div>

        {/* Stats row — 4-col desktop, 2-col mobile */}
        <div className="grid-stats">
          {[
            { icon: "🔥", label: "Streak",   value: stats?.day_streak ?? 0,        bg: "var(--amber-tint)",  color: "var(--amber)"  },
            { icon: "✦",  label: "Coins",    value: stats?.sakura_coins ?? 0,       bg: "var(--pro-tint)",    color: "var(--pro)"    },
            { icon: "📚", label: "Lessons",  value: stats?.lessons_completed ?? 0,  bg: "var(--accent-tint)", color: "var(--accent)" },
            { icon: "語", label: "Vocab",    value: stats?.vocab_mastered ?? 0,     bg: "var(--sage-tint)",   color: "var(--sage)"   },
          ].map((s) => (
            <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 16, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--shadow-card)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, fontFamily: "var(--font-jp)" }}>{s.icon}</div>
              <div>
                <div className="label" style={{ marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(20px, 4vw, 26px)", color: loading ? "var(--border)" : s.color, lineHeight: 1.1 }}>{loading ? "—" : s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Readiness Report — 3-col desktop, 1-col mobile */}
        <div style={{ ...cardStyle }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--ink)" }}>Readiness Report</div>
            <span className="pill pill-pro">Pro</span>
          </div>

          <div className="readiness-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>

            {/* Pass probability */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div className="label" style={{ alignSelf: "flex-start" }}>Pass Probability</div>
              <PassRing pct={passProb} />
              <div style={{ fontSize: 12, color: passProb >= 70 ? "var(--sage)" : "var(--accent)", fontWeight: 600, textAlign: "center" }}>
                {passProb >= 70 ? "✓ Exam eligible" : `${70 - passProb}% more to unlock`}
              </div>
            </div>

            {/* Section mastery */}
            <div>
              <div className="label" style={{ marginBottom: 14 }}>Section Mastery</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {SECTIONS.map((s) => (
                  <div key={s.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 500 }}>{s.label}</span>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>{s.pct}%</span>
                        <span style={{ fontSize: 10, color: s.pct >= s.prev ? "var(--sage)" : "var(--coral)", fontWeight: 600 }}>
                          {s.pct >= s.prev ? "▲" : "▼"} {Math.abs(s.pct - s.prev)}
                        </span>
                      </div>
                    </div>
                    <div className="progress-track" style={{ height: 6 }}>
                      <div className="progress-fill" style={{ width: `${s.pct}%`, background: s.pct >= 70 ? "var(--sage)" : "var(--accent)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Retention curve */}
            <div>
              <div className="label" style={{ marginBottom: 14 }}>Retention Curve</div>
              <div style={{ overflowX: "auto" }}>
                <RetentionChart />
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 6, display: "flex", gap: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ display: "inline-block", width: 12, height: 2, background: "var(--accent)" }} /> Actual
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ display: "inline-block", width: 12, height: 2, background: "var(--coral)", opacity: 0.5 }} /> Target
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Two-col: Kanji coverage + Recommended focus — stacks on mobile */}
        <div className="grid-2col">

          {/* Kanji coverage heatmap */}
          <div style={{ ...cardStyle }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>Kanji Coverage</div>
              <div style={{ display: "flex", gap: 10, fontSize: 11, color: "var(--ink-muted)" }}>
                {(["mature","learning","lapsed","unseen"] as KanjiStatus[]).map((s) => (
                  <span key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: KANJI_COLOR[s] }} />
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="kanji-grid" style={{ display: "grid", gridTemplateColumns: "repeat(13, 1fr)", gap: 3 }}>
              {KANJI_LIST.map((k, i) => (
                <div key={i} title={`${k.char} · ${k.status}`}
                  style={{ aspectRatio: "1", borderRadius: 4, background: KANJI_COLOR[k.status], display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-jp)", fontSize: 10, color: k.status === "mature" ? "#fff" : k.status === "unseen" ? "var(--ink-subtle)" : "var(--ink-soft)" }}>
                  {k.char !== "　" ? k.char : ""}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, fontSize: 12, color: "var(--ink-muted)" }}>
              <strong style={{ color: "var(--sage)" }}>20</strong> mature · <strong style={{ color: "var(--accent)" }}>7</strong> learning · <strong style={{ color: "var(--coral)" }}>6</strong> lapsed · 70 unseen
            </div>
          </div>

          {/* Recommended focus */}
          <div style={{ ...cardStyle }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--ink)", marginBottom: 16 }}>Recommended Focus</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {FOCUS_ROWS.map((row) => (
                <div key={row.title} style={{ background: row.accuracy < 55 ? "var(--coral-tint)" : "var(--base)", border: `1px solid ${row.accuracy < 55 ? "var(--coral-ring)" : "var(--border-soft)"}`, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>{row.title}</span>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: row.delta < 0 ? "var(--coral)" : "var(--sage)", fontWeight: 700 }}>
                        {row.delta < 0 ? "▼" : "▲"} {Math.abs(row.delta)}%
                      </span>
                      <span style={{ background: "var(--accent-tint)", color: "var(--accent)", borderRadius: 999, padding: "1px 8px", fontSize: 11, fontWeight: 600 }}>
                        {row.queued} cards
                      </span>
                    </div>
                  </div>
                  <div className="progress-track" style={{ height: 6 }}>
                    <div className="progress-fill" style={{ width: `${row.accuracy}%`, background: row.accuracy < 55 ? "var(--coral)" : "var(--accent)" }} />
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 6 }}>{row.accuracy}% accuracy</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Offline mode toggle */}
        <div style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: offlineOn ? "var(--sage-tint)" : "var(--base-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, transition: "background 0.2s" }}>
              {offlineOn ? "🔋" : "☁️"}
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--ink)", marginBottom: 2 }}>Offline Mode</div>
              <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                {offlineOn ? "7-day content cached for offline study" : "Enable to study without internet (Pro only)"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>{offlineOn ? "On" : "Off"}</span>
            <Toggle on={offlineOn} onToggle={() => setOfflineOn((v) => !v)} />
          </div>
        </div>

        {/* Subscription info */}
        <div style={{ background: "var(--pro-tint)", border: "1.5px solid var(--pro-ring)", borderRadius: 20, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="label" style={{ color: "var(--pro)", marginBottom: 4 }}>✦ Pro Subscription</div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>Renews Jun 28, 2026 · $12 / month</div>
          </div>
          <Link href="/settings" style={{ fontSize: 13, color: "var(--pro-hover)", textDecoration: "none", fontWeight: 600, border: "1px solid var(--pro-ring)", borderRadius: 10, padding: "7px 16px", background: "var(--surface)" }}>
            Manage plan →
          </Link>
        </div>

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
