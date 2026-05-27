/**
 * /super-admin — Super Admin only.
 * Server Component stub — Phase 7 will build the full UI.
 */

import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RoleBadge } from "@/components/ui/Badge";
import { PlaceholderCard } from "@/components/ui/Card";
import { RoleBanner } from "@/components/dashboard/RoleBanner";

const PLACEHOLDER_SECTIONS = [
  "System KPIs (MAU / MRR / ARR / Churn)",
  "Admin Management",
  "System Config (feature flags)",
  "Content CRUD",
  "Financial Dashboard",
  "Full Audit Log",
  "GDPR / Compliance",
  "API Keys",
];

export default async function SuperAdminPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return (
    <>
      <RoleBanner role={session.role} email={session.email} />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Super Admin</h1>
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
