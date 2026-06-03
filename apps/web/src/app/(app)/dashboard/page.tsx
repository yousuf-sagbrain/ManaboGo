"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useDashboard, nextLesson } from "@/hooks/useDashboard";

// ─── Static demo data ──────────────────────────────────────────
interface Badge { id: string; kanji: string; label: string; earned: boolean }
interface Friend { id: string; name: string; initials: string; action: string; time: string; color: string }

const BADGES: Badge[] = [
  { id: "first-lesson", kanji: "始",  label: "First Lesson",  earned: true  },
  { id: "streak-7",     kanji: "火",  label: "7-Day Streak",   earned: true  },
  { id: "kanji-10",     kanji: "漢",  label: "Kanji Learner",  earned: true  },
  { id: "mock-1",       kanji: "試",  label: "Mock Taker",     earned: false },
  { id: "coins-500",    kanji: "金",  label: "Coin Hoarder",   earned: false },
  { id: "perfect",      kanji: "完",  label: "Perfect Round",  earned: false },
];

const FRIENDS: Friend[] = [
  { id: "1", name: "Aisha K.",  initials: "AK", action: "Completed Kanji · Batch 2",   time: "2h ago",    color: "#5B6ABF" },
  { id: "2", name: "Tariq M.", initials: "TM", action: "Scored 92% on Mock Test",       time: "5h ago",    color: "#7BAE7F" },
  { id: "3", name: "Lena S.",  initials: "LS", action: "Unlocked 7-Day Streak badge",   time: "Yesterday", color: "#C9A96E" },
];

// ─── Shared stat card ─────────────────────────────────────────
function StatCard({ label, value, icon, accentBg, accentColor, loading }: {
  label: string; value: string | number; icon: string;
  accentBg: string; accentColor: string; loading?: boolean;
}) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 16, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0, boxShadow: "var(--shadow-card)" }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div className="label" style={{ marginBottom: 3 }}>{label}</div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(20px, 4vw, 26px)", color: loading ? "var(--border)" : accentColor, lineHeight: 1.1, transition: "color 0.2s" }}>
          {loading ? "—" : value}
        </div>
      </div>
    </div>
  );
}

// ─── Continue learning card ───────────────────────────────────
function ContinueLearningCard({ title, description, completedCount, totalCount, loading }: {
  title: string; description: string; completedCount: number; totalCount: number; loading?: boolean;
}) {
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 20, padding: "22px 24px", boxShadow: "var(--shadow-card)" }}>
      <div className="cta-row">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="label" style={{ color: "var(--accent)", marginBottom: 8 }}>Continue Learning</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(17px, 4vw, 21px)", color: "var(--ink)", margin: "0 0 6px 0" }}>
            {loading ? "Loading…" : title}
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink-muted)", margin: "0 0 16px 0", lineHeight: 1.6 }}>
            {loading ? "" : description}
          </p>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>{completedCount} / {totalCount} completed</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>{pct}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
        <div className="cta-actions" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
          <Link href="/learn" className="btn btn-primary" style={{ borderRadius: 12, fontSize: 14 }}>
            Start lesson →
          </Link>
          <span style={{ fontSize: 12, color: "var(--sage)", fontWeight: 600 }}>+200 XP available</span>
        </div>
      </div>
    </div>
  );
}

// ─── Daily reviews card ────────────────────────────────────────
function DailyReviewsCard({ totalDue }: { totalDue: number }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 14, flex: 1, minWidth: 0, boxShadow: "var(--shadow-card)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--accent-tint)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔄</div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>Daily Reviews</div>
          <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>SRS cards due today</div>
        </div>
        <span className="pill pill-free" style={{ marginLeft: "auto" }}>Free</span>
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 32, color: totalDue > 0 ? "var(--accent)" : "var(--sage)", lineHeight: 1 }}>
          {totalDue}
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 4 }}>
          {totalDue > 0 ? "cards ready for review" : "All caught up — great work!"}
        </div>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: totalDue > 0 ? "100%" : "0%" }} />
      </div>
      <Link
        href="/learn"
        style={{ display: "block", background: "var(--accent-tint)", border: "1.5px solid var(--accent-ring)", color: "var(--accent)", borderRadius: 12, padding: "10px 0", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, cursor: "pointer", textAlign: "center", textDecoration: "none", transition: "background 0.15s" }}
      >
        Review now →
      </Link>
    </div>
  );
}

// ─── Readiness card (free — blurred) ─────────────────────────
function ReadinessCard() {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 14, flex: 1, minWidth: 0, position: "relative", overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--pro-tint)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📊</div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>Readiness Report</div>
          <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>N5 exam readiness score</div>
        </div>
        <span className="pill pill-pro" style={{ marginLeft: "auto" }}>Pro</span>
      </div>

      {/* Blurred preview */}
      <div style={{ filter: "blur(6px)", opacity: 0.5, pointerEvents: "none", userSelect: "none", display: "flex", justifyContent: "center", alignItems: "center", height: 80 }}>
        <div style={{ display: "flex", gap: 20 }}>
          {[72, 85, 60].map((v, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div className="progress-track" style={{ width: 8, height: 60, borderRadius: 4, background: "var(--base-2)" }}>
                <div style={{ width: "100%", height: `${v}%`, background: "var(--accent)", borderRadius: 4, marginTop: `${100 - v}%`, transition: "none" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade overlay */}
      <div className="upgrade-blur">
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink-muted)", textAlign: "center", margin: 0 }}>
          Unlock your full 5-component Readiness Report
        </p>
        <Link
          href="/pricing"
          className="btn btn-pro"
          style={{ borderRadius: 12, fontSize: 14, width: "100%", justifyContent: "center" }}
        >
          ✦ Upgrade to Pro
        </Link>
        <button style={{ background: "none", border: "none", fontSize: 12, color: "var(--ink-subtle)", cursor: "pointer", padding: 0 }}>
          Maybe later
        </button>
      </div>
    </div>
  );
}

// ─── Roadmap preview ──────────────────────────────────────────
function RoadmapPreview() {
  const stages = [
    { label: "Stage 1: Kana Mastery",     pct: 100, done: true  },
    { label: "Stage 2: Kanji Acquisition", pct: 42,  done: false },
    { label: "Stage 3: Vocabulary",        pct: 0,   done: false },
    { label: "Stage 4: Grammar",           pct: 0,   done: false },
  ];
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 20, padding: 24, boxShadow: "var(--shadow-card)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--ink)", margin: 0 }}>Learning Roadmap</h3>
        <Link href="/roadmap" style={{ fontSize: 13, color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>View all →</Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {stages.map((s, i) => (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: s.done ? "var(--sage-tint)" : s.pct > 0 ? "var(--accent-tint)" : "var(--base-2)", border: `2px solid ${s.done ? "var(--sage)" : s.pct > 0 ? "var(--accent)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, flexShrink: 0 }}>
                  {s.done ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: s.done ? "var(--ink-muted)" : "var(--ink-soft)" }}>{s.label}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: s.done ? "var(--sage)" : s.pct > 0 ? "var(--accent)" : "var(--ink-subtle)" }}>{s.pct}%</span>
            </div>
            <div className="progress-track" style={{ height: 6 }}>
              <div className={`progress-fill${s.done ? "-sage" : ""}`} style={{ width: `${s.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Achievements ─────────────────────────────────────────────
function AchievementsSection({ lessonsCompleted }: { lessonsCompleted: number }) {
  const badges = BADGES.map((b) =>
    b.id === "first-lesson" ? { ...b, earned: lessonsCompleted >= 1 } : b
  );
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 20, padding: 24, boxShadow: "var(--shadow-card)" }}>
      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--ink)", margin: "0 0 18px 0" }}>Achievements</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))", gap: 12 }}>
        {badges.map((badge) => (
          <div key={badge.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: badge.earned ? 1 : 0.4, filter: badge.earned ? "none" : "grayscale(1)", transition: "opacity 0.2s" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: badge.earned ? "var(--accent-tint)" : "var(--base-2)", border: `1.5px solid ${badge.earned ? "var(--accent-ring)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--font-jp)", fontSize: badge.earned ? 24 : 20, color: badge.earned ? "var(--accent)" : "var(--ink-subtle)" }}>
                {badge.earned ? badge.kanji : "？"}
              </span>
            </div>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: badge.earned ? "var(--ink-soft)" : "var(--ink-subtle)", textAlign: "center", lineHeight: 1.3, fontWeight: badge.earned ? 500 : 400 }}>{badge.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Friend activity ──────────────────────────────────────────
function FriendActivity() {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 20, padding: 24, boxShadow: "var(--shadow-card)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--ink)", margin: 0 }}>Friend Activity</h3>
        <Link href="/friends" style={{ fontSize: 13, color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>See all →</Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {FRIENDS.map((f) => (
          <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: f.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{f.initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>{f.name}</div>
              <div style={{ fontSize: 12, color: "var(--ink-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.action}</div>
            </div>
            <span style={{ fontSize: 11, color: "var(--ink-subtle)", flexShrink: 0 }}>{f.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function DashboardPage() {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const user = useAuthStore((s) => s.user);
  const { stats, lessons, totalDue, loading } = useDashboard();

  const today     = nextLesson(lessons);
  const firstName = user?.fullName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";
  const showBanner = !bannerDismissed && !user?.emailVerified;

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "var(--base)" }}>
      <div className="page-pad" style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1100, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>

        {/* Email verification banner */}
        {showBanner && (
          <div className="animate-slide-down" style={{ background: "var(--amber-tint)", border: "1px solid var(--amber-ring)", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>📩</div>
            <span style={{ flex: 1, fontSize: 13, color: "#7A4F1A", minWidth: 0, lineHeight: 1.5 }}>
              <strong>Verify your email</strong> to unlock XP &amp; badges. 3 free sessions left.
            </span>
            <button onClick={() => setBannerDismissed(true)} aria-label="Dismiss" style={{ background: "none", border: "none", cursor: "pointer", color: "#7A4F1A", padding: 6, borderRadius: 6, fontSize: 18, opacity: 0.6, lineHeight: 1, flexShrink: 0 }}>✕</button>
          </div>
        )}

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(22px, 5vw, 28px)", color: "var(--ink)", margin: "0 0 4px 0" }}>
              Good to see you, {firstName}
            </h1>
            <p style={{ fontSize: 14, color: "var(--ink-muted)", margin: 0 }}>
              {totalDue > 0 ? `${totalDue} review cards waiting.` : "Your daily lesson is ready."}
            </p>
          </div>
          <div style={{ background: "var(--accent-tint)", border: "1px solid var(--accent-ring)", borderRadius: 999, padding: "6px 14px", fontSize: 12, color: "var(--accent)", display: "flex", alignItems: "center", gap: 5, fontWeight: 600, whiteSpace: "nowrap", alignSelf: "center" }}>
            📅 N5 · Lv {stats?.xp_level ?? 1}
          </div>
        </div>

        {/* Stats row — 4-col desktop, 2-col mobile */}
        <div className="grid-stats">
          <StatCard icon="🔥" label="Streak"   value={stats?.day_streak ?? 0}        accentBg="var(--amber-tint)"  accentColor="var(--amber)"   loading={loading} />
          <StatCard icon="✦"  label="Coins"    value={stats?.sakura_coins ?? 0}       accentBg="var(--pro-tint)"    accentColor="var(--pro)"     loading={loading} />
          <StatCard icon="📚" label="Lessons"  value={stats?.lessons_completed ?? 0}  accentBg="var(--accent-tint)" accentColor="var(--accent)"  loading={loading} />
          <StatCard icon="語" label="Vocab"    value={stats?.vocab_mastered ?? 0}     accentBg="var(--sage-tint)"   accentColor="var(--sage)"    loading={loading} />
        </div>

        {/* Continue learning */}
        <ContinueLearningCard
          title={today?.title ?? "Hiragana · Row あ"}
          description={today?.description ?? "Start your first lesson to begin your kana journey."}
          completedCount={lessons.filter((l) => l.completed).length}
          totalCount={Math.max(lessons.length, 1)}
          loading={loading}
        />

        {/* Two-col: reviews + readiness — stacks on mobile */}
        <div className="grid-2col">
          <DailyReviewsCard totalDue={totalDue} />
          <ReadinessCard />
        </div>

        {/* Roadmap preview */}
        <RoadmapPreview />

        {/* Achievements */}
        <AchievementsSection lessonsCompleted={stats?.lessons_completed ?? 0} />

        {/* Friend activity */}
        <FriendActivity />

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
