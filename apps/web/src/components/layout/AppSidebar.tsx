"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { hasMinimumRole } from "@/lib/permissions";
import { Role } from "@manabogo/shared";

// ── Icons ──────────────────────────────────────────────────────
function IconHome({ size = 20, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}
function IconBook({ size = 20, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}
function IconReview({ size = 20, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}
function IconProfile({ size = 20, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
function IconMock({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}
function IconGames({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
    </svg>
  );
}
function IconFriends({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function IconRoadmap({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
}
function IconAdmin({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
function IconSignOut({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function ManaboMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="var(--accent)" />
      <text x="20" y="27" textAnchor="middle" fontSize="18" fontWeight="700" fill="#fff" fontFamily="var(--font-jp)">学</text>
    </svg>
  );
}

interface NavEntry {
  href: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; active?: boolean }>;
  minRole?: Role;
  proLock?: boolean;
  exact?: boolean;
}

const NAV_ITEMS: NavEntry[] = [
  { href: "/dashboard",   label: "Home",     Icon: IconHome,    exact: true },
  { href: "/roadmap",     label: "Roadmap",  Icon: IconRoadmap },
  { href: "/learn",       label: "Practice", Icon: IconBook },
  { href: "/mock-result", label: "Mock",     Icon: IconMock,    proLock: true },
  { href: "/games",       label: "Games",    Icon: IconGames },
  { href: "/friends",     label: "Friends",  Icon: IconFriends },
  { href: "/settings",    label: "Profile",  Icon: IconProfile },
  { href: "/admin",       label: "Admin",    Icon: IconAdmin,   minRole: Role.Admin },
];

// ── Bottom tab bar (mobile, 4 items) ─────────────────────────────
const BOTTOM_TABS: NavEntry[] = [
  { href: "/dashboard",  label: "Home",   Icon: IconHome,    exact: true },
  { href: "/roadmap",    label: "Learn",  Icon: IconBook },
  { href: "/learn",      label: "Review", Icon: IconReview },
  { href: "/settings",   label: "Profile",Icon: IconProfile },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="bottom-tab-bar" aria-label="Main navigation">
      {BOTTOM_TABS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-tab${isActive ? " active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <item.Icon size={22} active={isActive} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// ── Desktop sidebar ───────────────────────────────────────────────
export function AppSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const user     = useAuthStore((s) => s.user);
  const tier     = user?.role === "pro_user" ? "pro" : "free";

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.minRole || (user && hasMinimumRole(user.role, item.minRole))
  );

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    useAuthStore.getState().clearAuth();
    router.push("/login");
  };

  return (
    <aside
      className="app-sidebar"
      style={{
        width: 232,
        minWidth: 232,
        background: "var(--surface)",
        borderRight: "1px solid var(--border-soft)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 12px",
        gap: 20,
        height: "100vh",
        flexShrink: 0,
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 10px 8px" }}>
        <ManaboMark size={32} />
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--ink)", lineHeight: 1.1 }}>
            ManaboGo
          </div>
          <div style={{ fontSize: 10, color: "var(--ink-muted)", marginTop: 2, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>
            JLPT N5
          </div>
        </div>
        {tier === "pro" && (
          <span className="pill pill-pro" style={{ marginLeft: "auto" }}>Pro</span>
        )}
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
        {visibleItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "9px 12px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--accent)" : "var(--ink-muted)",
                background: isActive ? "var(--accent-tint)" : "transparent",
                textDecoration: "none",
                transition: "background 150ms ease, color 150ms ease",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "var(--base-2)";
                  (e.currentTarget as HTMLElement).style.color = "var(--ink-soft)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--ink-muted)";
                }
              }}
            >
              <item.Icon size={18} active={isActive} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.proLock && tier === "free" && (
                <span className="pill pill-pro" style={{ fontSize: 9, height: 18, padding: "0 6px" }}>
                  Pro
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Tier banner */}
      {tier === "free" && (
        <div style={{ background: "var(--pro-tint)", border: "1px solid var(--pro-ring)", borderRadius: 12, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--pro)", letterSpacing: "0.04em" }}>
            ✦ Upgrade to Pro
          </span>
          <span style={{ fontSize: 11, color: "var(--ink-muted)", lineHeight: 1.4 }}>
            Unlock certification, full readiness report &amp; more
          </span>
          <Link
            href="/pricing"
            style={{ marginTop: 2, fontSize: 12, fontWeight: 600, color: "var(--pro-hover)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
          >
            Learn more →
          </Link>
        </div>
      )}

      {/* Sign out */}
      <button
        onClick={handleLogout}
        style={{
          display: "flex", alignItems: "center", gap: 9,
          padding: "9px 12px", borderRadius: 10, fontSize: 13,
          fontWeight: 500, color: "var(--ink-muted)",
          background: "transparent", border: "none", cursor: "pointer",
          transition: "color 150ms ease, background 150ms ease",
          width: "100%", textAlign: "left",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "var(--coral-tint)";
          (e.currentTarget as HTMLElement).style.color = "var(--coral)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "transparent";
          (e.currentTarget as HTMLElement).style.color = "var(--ink-muted)";
        }}
      >
        <IconSignOut size={16} />
        Sign out
      </button>
    </aside>
  );
}
