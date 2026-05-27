/**
 * /learn — Placeholder for Phase 1+ (Kana Mastery Port).
 * Server Component.
 */

import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PlaceholderCard } from "@/components/ui/Card";
import { RoleBanner } from "@/components/dashboard/RoleBanner";

export default async function LearnPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return (
    <>
      <RoleBanner role={session.role} email={session.email} />
      <h1 className="text-2xl font-bold text-slate-900 font-display mb-8">
        Learn
      </h1>
      <PlaceholderCard title="JLPT N5 Learning Modules — Phase 1+" height="h-64" />
    </>
  );
}
