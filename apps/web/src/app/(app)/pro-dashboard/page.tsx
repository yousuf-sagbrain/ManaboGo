/**
 * /pro-dashboard — Pro User+ (role: pro_user, admin, super_admin)
 * Server Component stub — Phase 7 will build the full UI.
 * Middleware already blocks user-role access.
 */

import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RoleBadge } from "@/components/ui/Badge";
import { PlaceholderCard } from "@/components/ui/Card";
import { RoleBanner } from "@/components/dashboard/RoleBanner";

const PLACEHOLDER_SECTIONS = [
  "Daily Lesson",
  "Practice",
  "Full Mock",
  "Readiness Report — Vocabulary",
  "Readiness Report — Grammar",
  "Readiness Report — Kanji",
  "Readiness Report — Listening",
  "Readiness Report — Reading",
  "Exam Prep Mode Banner",
  "Offline Mode Toggle",
  "Subscription Management",
];

export default async function ProDashboardPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return (
    <>
      <RoleBanner role={session.role} email={session.email} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Pro Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">{session.email}</p>
        </div>
        <RoleBadge role={session.role} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PLACEHOLDER_SECTIONS.map((title) => (
          <PlaceholderCard key={title} title={title} />
        ))}
      </div>
    </>
  );
}
