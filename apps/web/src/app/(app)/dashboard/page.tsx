/**
 * /dashboard — User+ (role: user, pro_user, admin, super_admin)
 * Server Component stub — Phase 7 will build the full UI.
 */

import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RoleBadge } from "@/components/ui/Badge";
import { PlaceholderCard } from "@/components/ui/Card";
import { RoleBanner } from "@/components/dashboard/RoleBanner";

const PLACEHOLDER_SECTIONS = [
  "Daily Lesson",
  "Practice",
  "Quick Mock (1/wk)",
  "Progress Bars",
  "Achievements",
  "Test History",
  "Friend Activity",
  "Readiness Report Preview (blurred — upgrade CTA)",
];

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return (
    <>
      <RoleBanner role={session.role} email={session.email} />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">{session.email}</p>
        </div>
        <RoleBadge role={session.role} />
      </div>

      {/* Placeholder grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PLACEHOLDER_SECTIONS.map((title) => (
          <PlaceholderCard key={title} title={title} />
        ))}
      </div>
    </>
  );
}
