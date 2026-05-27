/**
 * (app) group layout — protected app shell.
 * Server Component: reads auth cookie, redirects to /login if missing.
 */

import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/AppSidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar — client component, reads role from Zustand after hydration */}
      <AppSidebar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
