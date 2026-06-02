"use client";

import { usePathname } from "next/navigation";
import { AppNavbar } from "./AppNavbar";

const ROUTE_META: Record<string, { title: string; badge?: string }> = {
  "/dashboard":              { title: "Dashboard" },
  "/pro-dashboard":          { title: "Pro Dashboard",        badge: "PRO" },
  "/learn":                  { title: "Practice" },
  "/kana":                   { title: "Kana Practice",        badge: "Phase 1" },
  "/kana/typing":            { title: "Typing Practice",      badge: "Kana" },
  "/kana/multiple-choice":   { title: "Multiple Choice",      badge: "Kana" },
  "/kana/match":             { title: "Script Matching",      badge: "Kana" },
  "/kana/listening":         { title: "Listening Practice",   badge: "Kana" },
  "/kana/time-attack":       { title: "Time Attack",          badge: "Kana" },
  "/mock-result":            { title: "Mock Test Results" },
  "/certificate":            { title: "Certificate" },
  "/settings":               { title: "Settings" },
  "/games":                  { title: "Games" },
  "/friends":                { title: "Friends" },
};

export function NavbarWrapper() {
  const pathname = usePathname();
  const meta = ROUTE_META[pathname] ?? { title: "Manabo" };
  return <AppNavbar title={meta.title} badge={meta.badge} />;
}
