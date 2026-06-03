"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

interface Notification {
  id: string;
  icon: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: "1", icon: "🔥", title: "Streak reminder",      body: "You're on a 7-day streak — keep it going!",  time: "2 min ago",  read: false },
  { id: "2", icon: "📚", title: "New lesson available", body: "Kanji Batch 3 is ready for you.",             time: "1 hr ago",   read: false },
  { id: "3", icon: "🏆", title: "Achievement unlocked", body: "You earned the \"7-Day Streak\" badge.",       time: "Yesterday",  read: true  },
  { id: "4", icon: "👥", title: "Friend activity",      body: "Tariq M. scored 92% on the N5 Mock Test.",   time: "2 days ago", read: true  },
];

const GUIDE_SECTIONS = [
  { icon: "🗺️", title: "Dashboard",               body: "Your home base. See today's lesson, streak, coins, and friend activity at a glance." },
  { icon: "📚", title: "Practice",                 body: "Drill vocabulary, grammar, and kanji using spaced repetition. Cards resurface right when you're about to forget them." },
  { icon: "📝", title: "Mock Tests",               body: "Simulate the real JLPT N5 exam under timed conditions. Review your answers to target weak spots." },
  { icon: "🎮", title: "Games",                    body: "Reinforce learning through interactive mini-games — Sentence Scramble, Reading Rush, Kanji Battle Arena." },
  { icon: "👥", title: "Friends",                  body: "Add friends, compare streaks, and challenge each other. A little healthy competition goes a long way." },
  { icon: "🔥", title: "Streaks & Coins",          body: "Complete lessons every day to grow your streak. Earn Sakura Coins to spend on cosmetics and power-ups." },
  { icon: "📊", title: "Readiness Report (Pro)",   body: "A detailed breakdown of your N5 readiness by section. Upgrade to Pro to unlock your personalised score." },
  { icon: "⚙️", title: "Settings",                 body: "Update your profile, manage sessions, and export or delete your data at any time." },
];

// ── Guide modal ───────────────────────────────────────────────
function GuideModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(30,28,26,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <div
        className="animate-scale-in"
        style={{ background: "var(--surface)", borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "85dvh", display: "flex", flexDirection: "column", boxShadow: "var(--shadow-modal)", border: "1px solid var(--border-soft)" }}
      >
        <div style={{ padding: "22px 24px 18px", borderBottom: "1px solid var(--border-soft)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--accent-tint)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📖</div>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--ink)", margin: 0 }}>ManaboGo User Guide</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ink-muted)", margin: 0 }}>Everything you need to master JLPT N5</p>
          </div>
          <button onClick={onClose} aria-label="Close guide" style={{ marginLeft: "auto", background: "var(--base-2)", border: "none", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: "var(--ink-muted)" }}>
            ✕
          </button>
        </div>
        <div className="no-scrollbar" style={{ overflowY: "auto", padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
          {GUIDE_SECTIONS.map((s) => (
            <div key={s.title} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "var(--base)", border: "1px solid var(--border-soft)", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--ink)", marginBottom: 3 }}>{s.title}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6 }}>{s.body}</div>
              </div>
            </div>
          ))}
          <div style={{ background: "var(--accent-tint)", border: "1px solid var(--accent-ring)", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--accent-press)", margin: 0, lineHeight: 1.6 }}>
              <strong>Pro tip:</strong> Aim for 10 minutes of daily practice. Short consistent sessions beat occasional long ones for language retention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Notification panel ────────────────────────────────────────
function NotificationPanel({ notifications, onMarkAllRead, onClose }: {
  notifications: Notification[];
  onMarkAllRead: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div ref={ref} className="animate-slide-down" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 320, background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 16, boxShadow: "var(--shadow-card-md)", zIndex: 1000, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid var(--border-soft)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>Notifications</span>
          {unread > 0 && <span style={{ background: "var(--accent)", color: "#fff", borderRadius: 999, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{unread}</span>}
        </div>
        {unread > 0 && (
          <button onClick={onMarkAllRead} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--accent)", fontWeight: 600, padding: 0 }}>
            Mark all read
          </button>
        )}
      </div>
      <div className="no-scrollbar" style={{ maxHeight: 300, overflowY: "auto" }}>
        {notifications.length === 0 ? (
          <div style={{ padding: "28px 16px", textAlign: "center", fontSize: 13, color: "var(--ink-muted)" }}>You&apos;re all caught up 🎉</div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "11px 16px", borderBottom: "1px solid var(--border-soft)", background: n.read ? "transparent" : "var(--accent-tint)" }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: n.read ? "var(--base-2)" : "var(--surface)", border: "1px solid var(--border-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{n.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>{n.title}</span>
                  {!n.read && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", flexShrink: 0, display: "inline-block" }} />}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 1, lineHeight: 1.5 }}>{n.body}</div>
                <div style={{ fontSize: 11, color: "var(--ink-subtle)", marginTop: 3 }}>{n.time}</div>
              </div>
            </div>
          ))
        )}
      </div>
      <div style={{ padding: "9px 16px", borderTop: "1px solid var(--border-soft)", textAlign: "center" }}>
        <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>View all notifications</button>
      </div>
    </div>
  );
}

// ── Avatar dropdown ───────────────────────────────────────────
function AvatarDropdown({ user, initials, onClose }: {
  user: { fullName: string | null; email: string; role: string } | null;
  initials: string;
  onClose: () => void;
}) {
  const router   = useRouter();
  const ref      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", h);
    window.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); window.removeEventListener("keydown", k); };
  }, [onClose]);

  const handleLogout = async () => {
    onClose();
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    useAuthStore.getState().clearAuth();
    router.push("/login");
  };

  const menuItemStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 10,
    padding: "9px 16px", fontSize: 13, fontWeight: 500,
    color: "var(--ink-soft)", background: "none", border: "none",
    cursor: "pointer", width: "100%", textAlign: "left",
    textDecoration: "none", transition: "background 120ms ease",
  };

  return (
    <div
      ref={ref}
      className="animate-slide-down"
      style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 220, background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 14, boxShadow: "var(--shadow-card-md)", zIndex: 1000, overflow: "hidden" }}
    >
      {/* User identity header */}
      <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid var(--border-soft)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent-tint-2)", border: "2px solid var(--accent-ring)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          {user?.fullName && (
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.fullName}
            </div>
          )}
          <div style={{ fontSize: 12, color: "var(--ink-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.email}
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div style={{ padding: "6px 0" }}>
        <Link
          href="/settings"
          onClick={onClose}
          style={menuItemStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--base-2)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Settings
        </Link>

        <Link
          href="/settings"
          onClick={onClose}
          style={menuItemStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--base-2)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Profile
        </Link>

        <div style={{ height: 1, background: "var(--border-soft)", margin: "4px 0" }} />

        <button
          onClick={handleLogout}
          style={{ ...menuItemStyle, color: "var(--coral)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--coral-tint)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  );
}

// ── AppNavbar ─────────────────────────────────────────────────
interface AppNavbarProps {
  title: string;
  badge?: string;
  leftExtra?: React.ReactNode;
}

export function AppNavbar({ title, badge, leftExtra }: AppNavbarProps) {
  const user       = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? (isHydrated ? "?" : "…");

  const [notifications,      setNotifications]      = useState<Notification[]>(DEMO_NOTIFICATIONS);
  const [showNotifications,  setShowNotifications]  = useState(false);
  const [showGuide,          setShowGuide]          = useState(false);
  const [showAvatarMenu,     setShowAvatarMenu]     = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const iconBtnStyle: React.CSSProperties = {
    width: 34, height: 34, borderRadius: 9,
    background: "var(--base-2)", border: "1px solid var(--border-soft)",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: "var(--ink-muted)",
    transition: "background 150ms ease, color 150ms ease",
    flexShrink: 0,
  };

  return (
    <>
      <div style={{
        height: 58,
        background: "var(--surface)",
        borderBottom: "1px solid var(--border-soft)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px",
        flexShrink: 0,
        position: "sticky", top: 0, zIndex: 100,
      }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span>
          {badge && <span className="pill pill-accent">{badge}</span>}
          {leftExtra}
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>

          {/* Guide button */}
          <button
            onClick={() => setShowGuide(true)}
            title="User Guide"
            aria-label="Open user guide"
            style={iconBtnStyle}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--base-3)"; (e.currentTarget as HTMLElement).style.color = "var(--ink-soft)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--base-2)"; (e.currentTarget as HTMLElement).style.color = "var(--ink-muted)"; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <circle cx="12" cy="17" r="0.5" fill="currentColor" />
            </svg>
          </button>

          {/* Notification bell */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => { setShowNotifications((v) => !v); setShowAvatarMenu(false); }}
              aria-label="Notifications"
              style={{ ...iconBtnStyle, background: showNotifications ? "var(--base-3)" : "var(--base-2)", position: "relative" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--base-3)"; (e.currentTarget as HTMLElement).style.color = "var(--ink-soft)"; }}
              onMouseLeave={(e) => { if (!showNotifications) { (e.currentTarget as HTMLElement).style.background = "var(--base-2)"; (e.currentTarget as HTMLElement).style.color = "var(--ink-muted)"; } }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span style={{ position: "absolute", top: 5, right: 5, width: 7, height: 7, borderRadius: "50%", background: "var(--coral)", border: "2px solid var(--surface)" }} />
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
          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 2px" }} />

          {/* Avatar — opens dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => { setShowAvatarMenu((v) => !v); setShowNotifications(false); }}
              aria-label="Account menu"
              aria-expanded={showAvatarMenu}
              style={{
                width: 34, height: 34, borderRadius: "50%",
                background: showAvatarMenu ? "var(--accent-tint-2)" : "var(--accent-tint-2)",
                border: `2px solid ${showAvatarMenu ? "var(--accent)" : "var(--accent-ring)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--accent)", fontFamily: "var(--font-display)",
                fontWeight: 700, fontSize: 13,
                cursor: "pointer", userSelect: "none", flexShrink: 0,
                transition: "border-color 150ms ease",
              }}
            >
              {initials}
            </button>
            {showAvatarMenu && (
              <AvatarDropdown
                user={user}
                initials={initials}
                onClose={() => setShowAvatarMenu(false)}
              />
            )}
          </div>
        </div>
      </div>

      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
    </>
  );
}
