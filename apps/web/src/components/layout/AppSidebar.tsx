"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { RoleBadge } from "@/components/ui/Badge";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { hasMinimumRole } from "@/lib/permissions";
import { Role } from "@manabogo/shared";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  minRole?: Role;
}

const NavIcon = ({ d }: { d: string }) => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const navItems: NavItem[] = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <NavIcon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    },
    {
      href: "/pro-dashboard",
      label: "Pro Dashboard",
      icon: <NavIcon d="M13 10V3L4 14h7v7l9-11h-7z" />,
      minRole: Role.ProUser,
    },
    {
      href: "/learn",
      label: "Learn",
      icon: <NavIcon d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: <NavIcon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
    },
    {
      href: "/admin",
      label: "Admin",
      icon: <NavIcon d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
      minRole: Role.Admin,
    },
    {
      href: "/super-admin",
      label: "Super Admin",
      icon: <NavIcon d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />,
      minRole: Role.SuperAdmin,
    },
  ];

  const visibleItems = navItems.filter(
    (item) =>
      !item.minRole ||
      (user && hasMinimumRole(user.role, item.minRole))
  );

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    useAuthStore.getState().clearAuth();
    router.push("/login");
  };

  return (
    <aside className="flex flex-col h-full w-64 bg-white border-r border-slate-100">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100">
        <Link href="/" className="text-xl font-bold text-sakura font-display">
          ManaboGo
        </Link>
      </div>

      {/* User info */}
      {user && (
        <div className="px-4 py-4 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sakura/10 flex items-center justify-center text-sakura font-bold text-sm">
              {(user.fullName ?? user.email)[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user.fullName ?? user.email}
              </p>
              <RoleBadge role={user.role} />
            </div>
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              ].join(" ")}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-2 border-t border-slate-100 pt-3">
        <LanguageSwitcher />
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all w-full text-left"
        >
          <NavIcon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
