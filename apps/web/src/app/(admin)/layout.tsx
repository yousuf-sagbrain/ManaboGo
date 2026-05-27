/**
 * (admin) route group layout — requires admin+ role.
 * Server Component: verifies auth, redirects if insufficient role.
 */

import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { hasMinimumRole } from "@/lib/permissions";
import { Role } from "@manabogo/shared";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AdminNav } from "@/components/layout/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (!hasMinimumRole(session.role, Role.Admin)) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNav />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
