/**
 * (app) group layout — protected app shell.
 * Server Component: reads auth cookie, redirects to /login if missing.
 */

import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { AppSidebar, BottomTabBar } from "@/components/layout/AppSidebar";
import { NavbarWrapper } from "@/components/layout/NavbarWrapper";
import { AuthHydration } from "@/components/auth/AuthHydration";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div style={{ display: "flex", width: "100%", height: "100dvh", background: "var(--base)", overflow: "hidden" }}>
      <AuthHydration />
      {/* Desktop sidebar — hidden on mobile via CSS */}
      <AppSidebar />
      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <NavbarWrapper />
        <main
          className="app-main-offset"
          style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}
        >
          {children}
        </main>
      </div>
      {/* Mobile bottom tab bar — hidden on desktop via CSS */}
      <BottomTabBar />
    </div>
  );
}
