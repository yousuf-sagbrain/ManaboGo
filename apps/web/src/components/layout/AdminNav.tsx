"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_NAV = [
  { href: "/admin", label: "Admin Dashboard" },
  { href: "/super-admin", label: "Super Admin" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-2 px-4 py-2 bg-indigo-50 border-b border-indigo-100">
      {ADMIN_NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={[
            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            pathname === item.href
              ? "bg-indigo-600 text-white"
              : "text-indigo-700 hover:bg-indigo-100",
          ].join(" ")}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
