"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/authStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  icon: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

// ─── Static demo notifications ────────────────────────────────────────────────

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: "1", icon: "🔥", title: "Streak reminder",      body: "You're on a 7-day streak — don't break it!",     time: "2 min ago",  read: false },
  { id: "2", icon: "🎌", title: "New lesson available", body: "Kanji Batch 3 is ready for you.",                 time: "1 hr ago",   read: false },
  { id: "3", icon: "🏆", title: "Achievement unlocked", body: "You earned the \"7-Day Streak\" badge.",           time: "Yesterday",  read: true  },
  { id: "4", icon: "👫", title: "Friend activity",      body: "Tariq M. scored 92% on the N5 Mock Test.",        time: "2 days ago", read: true  },
];

// ─── Guide sections ───────────────────────────────────────────────────────────

const GUIDE_SECTIONS = [
  { icon: "🗺️", title: "Dashboard",                body: "Your home base. See today's lesson, your streak, coins, and friend activity at a glance." },
  { icon: "📚", title: "Practice",                  body: "Drill vocabulary, grammar, and kanji using spaced repetition (SRS). Cards resurface right when you're about to forget them." },
  { icon: "📝", title: "Mock Tests",                body: "Simulate the real JLPT N5 exam under timed conditions. Review your answers afterward to target weak spots." },
  { icon: "🎮", title: "Games",                     body: "Reinforce what you've learned through interactive mini-games — make studying feel less like studying." },
  { icon: "👫", title: "Friends",                   body: "Add friends, compare streaks, and cheer each other on. A little competition goes a long way." },
  { icon: "🔥", title: "Streaks & Coins",           body: "Log in and complete lessons every day to grow your streak. Earn Sakura Coins you can spend on power-ups and cosmetics." },
  { icon: "📊", title: "Readiness Report (Pro)",    body: "A detailed breakdown of your N5 readiness by topic. Upgrade to Pro to unlock your personalised score." },
  { icon: "⚙️", title: "Settings",                  body: "Update your profile, change your password, manage active sessions, and export or delete your data at any time." },
];

// ─── Guide modal ──────────────────────────────────────────────────────────────

function GuideModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,20,40,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 600, maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(15,20,40,0.22)" }}>
        {/* Header */}
        <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--tint-indigo)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📖</div>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--ink)", margin: 0 }}>ManaboGo User Guide</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", margin: 0 }}>Everything you need to know to master JLPT N5</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close guide"
            style={{ marginLeft: "auto", background: "#F1F5F9", border: "none", borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18, color: "#64748B" }}
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: "auto", padding: "20px 28px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
          {GUIDE_SECTIONS.map((s) => (
            <div key={s.title} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 16, padding: "16px 18px" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fff", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--ink)", marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{s.body}</div>
              </div>
            </div>
          ))}
          <div style={{ background: "var(--tint-sakura)", border: "1px solid #BFDBFE", borderRadius: 14, padding: "14px 18px", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#1e40af", margin: 0, lineHeight: 1.6 }}>
              <strong>Pro tip:</strong> Aim for a 10-minute daily practice session. Consistent short sessions beat occasional long ones for language retention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Notification panel ───────────────────────────────────────────────────────

function NotificationPanel({ notifications, onMarkAllRead, onClose }: { notifications: Notification[]; onMarkAllRead: () => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div
      ref={ref}
      style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, width: 340, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 18, boxShadow: "0 16px 48px rgba(15,20,40,0.15)", zIndex: 1000, overflow: "hidden" }}
    >
      <div style={{ padding: "14px 18px 10px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>Notifications</span>
          {unread > 0 && (
            <span style={{ background: "var(--sakura)", color: "#fff", borderRadius: 999, padding: "1px 8px", fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700 }}>{unread}</span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={onMarkAllRead} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 12, color: "var(--indigo)", fontWeight: 600, padding: 0 }}>
            Mark all read
          </button>
        )}
      </div>

      <div style={{ maxHeight: 320, overflowY: "auto" }}>
        {notifications.length === 0 ? (
          <div style={{ padding: "28px 18px", textAlign: "center", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)" }}>
            You&apos;re all caught up 🎉
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 18px", borderBottom: "1px solid #F8FAFC", background: n.read ? "#fff" : "var(--tint-sakura)" }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: n.read ? "#F1F5F9" : "#fff", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{n.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>{n.title}</span>
                  {!n.read && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--sakura)", flexShrink: 0, marginTop: 4, display: "inline-block" }} />}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", marginTop: 2, lineHeight: 1.5 }}>{n.body}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#94A3B8", marginTop: 4 }}>{n.time}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ padding: "10px 18px", borderTop: "1px solid #F1F5F9", textAlign: "center" }}>
        <button style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 12, color: "var(--indigo)", fontWeight: 600 }}>
          View all notifications
        </button>
      </div>
    </div>
  );
}

// ─── AppNavbar ────────────────────────────────────────────────────────────────

interface AppNavbarProps {
  /** Page title shown on the left side of the navbar */
  title: string;
  /** Optional badge text shown next to the title (e.g. "JLPT N5", "PRO") */
  badge?: string;
  /** Extra content to render on the left, after the title */
  leftExtra?: React.ReactNode;
}

export function AppNavbar({ title, badge, leftExtra }: AppNavbarProps) {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? (isHydrated ? "?" : "…");

  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <div style={{
        height: 64,
        background: "#fff",
        borderBottom: "1px solid #E2E8F0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--ink)" }}>{title}</span>
          {badge && (
            <span style={{ background: "var(--tint-sakura)", color: "var(--sakura)", border: "1px solid #BFDBFE", borderRadius: 999, padding: "2px 10px", fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em" }}>
              {badge}
            </span>
          )}
          {leftExtra}
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

          {/* Guide button */}
          <button
            onClick={() => setShowGuide(true)}
            title="User Guide"
            aria-label="Open user guide"
            style={{ width: 36, height: 36, borderRadius: 10, background: "#F1F5F9", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#475569", transition: "background 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#E2E8F0")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#F1F5F9")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <circle cx="12" cy="17" r="0.5" fill="currentColor" />
            </svg>
          </button>

          {/* Notification bell */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowNotifications((v) => !v)}
              aria-label="Notifications"
              style={{ width: 36, height: 36, borderRadius: 10, background: showNotifications ? "#E2E8F0" : "#F1F5F9", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#475569", position: "relative", transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#E2E8F0")}
              onMouseLeave={(e) => { if (!showNotifications) e.currentTarget.style.background = "#F1F5F9"; }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "var(--sakura)", border: "2px solid #fff" }} />
              )}
            </button>
            {showNotifications && (
              <NotificationPanel
                notifications={notifications}
                onMarkAllRead={() => setNotifications((ns) => ns.map((n) => ({ ...n, read: true })))}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 24, background: "#E2E8F0", margin: "0 4px" }} />

          {/* Avatar */}
          <div
            title={user?.fullName ?? user?.email ?? ""}
            style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--sakura)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, cursor: "pointer", userSelect: "none", flexShrink: 0 }}
          >
            {initials}
          </div>
        </div>
      </div>

      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
    </>
  );
}
