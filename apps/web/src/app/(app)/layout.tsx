/**
 * (app) group layout — protected app shell.
 * Server Component: reads auth cookie, redirects to /login if missing.
 */

import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AuthHydration } from "@/components/auth/AuthHydration";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div style={{ display: "flex", width: "100%", height: "100vh", background: "var(--page)", overflow: "hidden" }}>
      <AuthHydration />
      <AppSidebar />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {children}
      </main>
    </div>
  );
}
