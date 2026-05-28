"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useDashboard, nextLesson } from "@/hooks/useDashboard";

// ─── Static data (social features — not yet API-driven) ───────────────────────

interface Badge { id: string; emoji: string; label: string; earned: boolean }
interface Friend { id: string; name: string; initials: string; action: string; time: string; avatarColor: string }

const BADGES: Badge[] = [
  { id: "first-lesson", emoji: "🎌", label: "First Lesson",  earned: true  },
  { id: "streak-7",    emoji: "🔥", label: "7-Day Streak",   earned: true  },
  { id: "kanji-10",   emoji: "⛩️", label: "Kanji Master",   earned: true  },
  { id: "mock-1",     emoji: "📝", label: "Mock Taker",      earned: false },
  { id: "coins-500",  emoji: "🪙", label: "Coin Hoarder",    earned: false },
  { id: "perfect",    emoji: "💯", label: "Perfect Round",   earned: false },
];

const FRIENDS: Friend[] = [
  { id: "1", name: "Aisha K.", initials: "AK", action: "Completed Kanji · Batch 2",    time: "2 h ago",  avatarColor: "#7C3AED" },
  { id: "2", name: "Tariq M.", initials: "TM", action: "Scored 92% on Mock Test",       time: "5 h ago",  avatarColor: "#04B888" },
  { id: "3", name: "Lena S.",  initials: "LS", action: "Unlocked 7-Day Streak badge",   time: "Yesterday", avatarColor: "#F59E0B" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function TopBar() {
  const user = useAuthStore((s) => s.user);
  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <div style={{ height: 60, background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 32px", gap: 16, flexShrink: 0 }}>
      <button style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#CBD5E1" }} aria-label="Notifications">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span style={{ position: "absolute", top: 5, right: 5, width: 8, height: 8, borderRadius: "50%", background: "var(--sakura)", border: "2px solid var(--ink)" }} />
      </button>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--sakura)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, cursor: "pointer", userSelect: "none" }}>
        {initials}
      </div>
    </div>
  );
}

function VerificationBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div style={{ background: "var(--tint-amber)", border: "1px solid #F6D074", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <span style={{ fontSize: 18 }}>📩</span>
      <span style={{ flex: 1, fontFamily: "var(--font-body)", fontSize: 14, color: "#92400E", minWidth: 200 }}>
        <strong>Check your email to verify your account.</strong>&nbsp; 3 free sessions left before XP locks.
      </span>
      <button onClick={onDismiss} aria-label="Dismiss" style={{ background: "none", border: "none", cursor: "pointer", color: "#92400E", padding: 4, borderRadius: 6, display: "flex", alignItems: "center", opacity: 0.7, lineHeight: 1, fontSize: 18 }}>×</button>
    </div>
  );
}

function StatCard({ icon, label, value, accentColor, iconBg, loading }: { icon: string; label: string; value: string | number; accentColor: string; iconBg: string; loading?: boolean }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: loading ? "var(--border)" : accentColor, lineHeight: 1.1, transition: "color 0.2s" }}>
          {loading ? "—" : value}
        </div>
      </div>
    </div>
  );
}

function LessonCard({ title, description, completedCount, totalCount, loading }: { title: string; description: string; completedCount: number; totalCount: number; loading?: boolean }) {
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 24, display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: "var(--sakura)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Today's lesson</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--ink)", margin: "0 0 6px 0" }}>
          {loading ? "Loading…" : title}
        </h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", margin: "0 0 16px 0" }}>
          {loading ? " " : description}
        </p>
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)" }}>{completedCount} / {totalCount} completed</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)" }}>{pct}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "var(--border)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: "var(--sakura)", transition: "width 0.4s ease" }} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
        <a href="/learn" style={{ background: "var(--sakura)", color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, cursor: "pointer", whiteSpace: "nowrap", textDecoration: "none", display: "inline-block" }}>
          Start lesson →
        </a>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--mint-soft)", fontWeight: 600 }}>
          +200 XP available
        </span>
      </div>
    </div>
  );
}

function MockTestCard({ totalDue }: { totalDue: number }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 12, flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 24 }}>📝</span>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "var(--ink)" }}>Quick Mock Test</span>
        <span style={{ marginLeft: "auto", background: "var(--tint-sakura)", color: "var(--sakura)", border: "1px solid #BFDBFE", borderRadius: 999, padding: "2px 10px", fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Free</span>
      </div>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", margin: 0 }}>
        {totalDue > 0 ? `${totalDue} SRS cards due for review` : "All caught up — great work!"}
      </p>
      <div style={{ height: 6, borderRadius: 999, background: "var(--border)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: totalDue > 0 ? "100%" : "0%", borderRadius: 999, background: "var(--sakura)", transition: "width 0.4s ease" }} />
      </div>
      <a href="/mock-result" style={{ background: "none", border: "1.5px solid var(--sakura)", color: "var(--sakura)", borderRadius: 12, padding: "10px 0", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 4, textAlign: "center", textDecoration: "none", display: "block" }}>
        Start Mock →
      </a>
    </div>
  );
}

function ReadinessCard() {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 12, flex: 1, minWidth: 0, position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 24 }}>📊</span>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "var(--ink)" }}>Readiness Report</span>
        <span style={{ marginLeft: "auto", background: "var(--tint-indigo)", color: "var(--indigo)", border: "1px solid #DDD6FE", borderRadius: 999, padding: "2px 10px", fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>PRO</span>
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 90, filter: "blur(6px)", opacity: 0.4, pointerEvents: "none", userSelect: "none" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", border: "10px solid var(--indigo)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--indigo)" }}>72%</span>
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", padding: 24, background: "linear-gradient(to top, rgba(255,255,255,0.97) 50%, rgba(255,255,255,0.2) 100%)", gap: 10 }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", textAlign: "center", margin: 0 }}>Unlock your full Readiness Report</p>
        <button style={{ background: "var(--sakura)", color: "#fff", border: "none", borderRadius: 12, padding: "10px 24px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, cursor: "pointer", width: "100%" }}>Upgrade to Pro</button>
      </div>
    </div>
  );
}

function AchievementsSection({ lessonsCompleted }: { lessonsCompleted: number }) {
  const badges = BADGES.map((b) => b.id === "first-lesson" ? { ...b, earned: lessonsCompleted >= 1 } : b);
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 24 }}>
      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "var(--ink)", margin: "0 0 16px 0" }}>Achievements</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 12 }}>
        {badges.map((badge) => (
          <div key={badge.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: badge.earned ? 1 : 0.35, filter: badge.earned ? "none" : "grayscale(1)" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: badge.earned ? "var(--tint-sakura)" : "var(--surface-2)", border: badge.earned ? "1.5px solid #BFDBFE" : "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
              {badge.earned ? badge.emoji : "🔒"}
            </div>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: badge.earned ? "var(--ink)" : "var(--muted-soft)", textAlign: "center", lineHeight: 1.3 }}>{badge.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FriendActivitySection() {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 24 }}>
      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "var(--ink)", margin: "0 0 16px 0" }}>Friend Activity</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {FRIENDS.map((friend) => (
          <div key={friend.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: friend.avatarColor, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{friend.initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>{friend.name}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{friend.action}</div>
            </div>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--muted-soft)", flexShrink: 0 }}>{friend.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const user = useAuthStore((s) => s.user);
  const { stats, lessons, totalDue, loading } = useDashboard();

  const today = nextLesson(lessons);
  const firstName = user?.fullName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--page)" }}>
      <TopBar />

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", display: "flex", flexDirection: "column", gap: 18, maxWidth: 1100, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        {!bannerDismissed && !user?.emailVerified && (
          <VerificationBanner onDismiss={() => setBannerDismissed(true)} />
        )}

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, color: "var(--ink)", margin: "0 0 4px 0" }}>
              Welcome back, {firstName} 👋
            </h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--muted)", margin: 0 }}>
              {totalDue > 0 ? `${totalDue} cards due for review.` : "Your daily lesson is ready."}
            </p>
          </div>
          <div style={{ background: "var(--tint-sakura)", border: "1px solid #BFDBFE", borderRadius: 999, padding: "8px 18px", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--sakura)", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", alignSelf: "center" }}>
            📅 JLPT N5 · {stats?.xp_level ?? 1} LVL
          </div>
        </div>

        {/* Stats row — live data */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          <StatCard icon="🔥" label="Day Streak"    value={stats?.day_streak ?? 0}          accentColor="var(--sakura)"  iconBg="var(--tint-sakura)"  loading={loading} />
          <StatCard icon="🪙" label="Sakura Coins"  value={stats?.sakura_coins ?? 0}         accentColor="#B07A00"        iconBg="var(--tint-amber)"   loading={loading} />
          <StatCard icon="📚" label="Lessons Done"  value={stats?.lessons_completed ?? 0}    accentColor="var(--ink)"     iconBg="var(--surface-2)"    loading={loading} />
          <StatCard icon="✨" label="Vocab Mastered" value={stats?.vocab_mastered ?? 0}       accentColor="var(--indigo)"  iconBg="var(--tint-indigo)"  loading={loading} />
        </div>

        {/* Lesson CTA — live data */}
        <LessonCard
          title={today?.title ?? "Numbers & Time"}
          description={today?.description ?? "Load your first lesson to begin."}
          completedCount={lessons.filter((l) => l.completed).length}
          totalCount={lessons.length}
          loading={loading}
        />

        {/* Two-col */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <MockTestCard totalDue={totalDue} />
          <ReadinessCard />
        </div>

        {/* Achievements — first-lesson badge unlocks from real data */}
        <AchievementsSection lessonsCompleted={stats?.lessons_completed ?? 0} />

        <FriendActivitySection />

        <div style={{ height: 12 }} />
      </div>
    </div>
  );
}
