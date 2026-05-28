"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { hasMinimumRole } from "@/lib/permissions";
import { Role } from "@manabogo/shared";

// ── Icons ──────────────────────────────────────────────────────
function IconHome({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}
function IconBook({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}
function IconMock({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}
function IconGames({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
    </svg>
  );
}
function IconFriends({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}
function IconProfile({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
function IconAdmin({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
function IconFlame({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.017 0C7.396 0 4.5 3.9 6.3 8.1c-.9-1.2-1.5-2.7-1.5-4.5C2.1 6.3 1.5 10.8 4.2 14.1c-.3-.9-.3-1.8-.3-2.7C1.8 13.5 1.5 17.1 3.9 19.5 5.4 21 7.5 22.5 10.5 22.5c4.8 0 9-3.6 9-8.7 0-2.1-.6-4.2-1.8-5.7-.6 1.2-1.5 2.1-2.4 2.7.9-2.7.9-6.9-3.3-10.8z" />
    </svg>
  );
}
function IconCoin({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" opacity="0.15" />
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="700">$</text>
    </svg>
  );
}
function IconSignOut({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

// ── SakuraMark logo icon ───────────────────────────────────────
function SakuraMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <ellipse
          key={i}
          cx="20" cy="10" rx="7" ry="10"
          fill="#fff"
          opacity="0.85"
          transform={`rotate(${deg} 20 20)`}
        />
      ))}
      <circle cx="20" cy="20" r="4" fill="#FFD166" />
    </svg>
  );
}

interface NavEntry {
  href: string;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
  minRole?: Role;
  proLock?: boolean;
}

const NAV_ITEMS: NavEntry[] = [
  { href: "/dashboard",     label: "Home",       Icon: IconHome },
  { href: "/learn",         label: "Practice",   Icon: IconBook },
  { href: "/mock-result",   label: "Mock Tests", Icon: IconMock, proLock: true },
  { href: "/games",         label: "Games",      Icon: IconGames },
  { href: "/friends",       label: "Friends",    Icon: IconFriends },
  { href: "/settings",      label: "Profile",    Icon: IconProfile },
  { href: "/admin",         label: "Admin",      Icon: IconAdmin, minRole: Role.Admin },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router  = useRouter();
  const user    = useAuthStore((s) => s.user);
  const tier    = user?.role === "pro_user" ? "pro" : "free";

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.minRole || (user && hasMinimumRole(user.role, item.minRole))
  );

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    useAuthStore.getState().clearAuth();
    router.push("/login");
  };

  return (
    <aside style={{
      width: 240,
      minWidth: 240,
      background: "#1A1F3C",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      padding: "20px 14px",
      gap: 22,
      fontFamily: "var(--font-body)",
      height: "100vh",
      flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px" }}>
        <SakuraMark size={28} />
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, lineHeight: 1 }}>ManaboGo</div>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 3, letterSpacing: "0.04em", textTransform: "uppercase" }}>JLPT N5</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 500,
                color: isActive ? "#fff" : "rgba(255,255,255,0.7)",
                background: isActive ? "rgba(255,255,255,0.06)" : "transparent",
                textDecoration: "none",
                transition: "background 150ms ease, color 150ms ease",
              }}
            >
              {isActive && (
                <span style={{
                  position: "absolute",
                  left: -14,
                  top: 6,
                  bottom: 6,
                  width: 3,
                  background: "var(--sakura)",
                  borderRadius: 2,
                }} />
              )}
              <item.Icon size={20} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.proLock && tier === "free" && (
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: "var(--indigo)",
                  background: "var(--tint-indigo)",
                  padding: "2px 6px",
                  borderRadius: 4,
                }}>PRO</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer — coins + streak */}
      <div style={{ display: "flex", gap: 8, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{
          flex: 1, display: "flex", alignItems: "center", gap: 6,
          padding: "8px 10px", background: "rgba(255,255,255,0.04)", borderRadius: 10, fontSize: 13,
        }}>
          <span style={{ color: "var(--gold)", display: "inline-flex" }}><IconCoin size={16} /></span>
          <span style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>248</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>coins</span>
        </div>
        <div style={{
          flex: 1, display: "flex", alignItems: "center", gap: 6,
          padding: "8px 10px", background: "rgba(255,255,255,0.04)", borderRadius: 10, fontSize: 13,
        }}>
          <span style={{ color: "var(--sakura)", display: "inline-flex" }}><IconFlame size={16} /></span>
          <span style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>12</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>days</span>
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={handleLogout}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px", borderRadius: 10, fontSize: 14,
          fontWeight: 500, color: "rgba(255,255,255,0.55)",
          background: "transparent", border: "none", cursor: "pointer",
          transition: "color 150ms ease",
          marginTop: -12,
        }}
      >
        <IconSignOut size={18} />
        Sign out
      </button>
    </aside>
  );
}
