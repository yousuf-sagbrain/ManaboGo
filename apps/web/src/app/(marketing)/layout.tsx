/** Marketing layout — nav + footer for SSG public pages. */

import Link from "next/link";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-sakura font-display">ManaboGo</Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
            <Link href="/about" className="hover:text-slate-900 transition-colors">About</Link>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-slate-900">Sign in</Link>
            <Link href="/register" className="bg-sakura text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg hover:brightness-105 transition-all">Start Free</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-white border-t border-slate-100 mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-slate-400">
          <p>© 2026 ManaboGo. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-slate-600">About</Link>
            <Link href="/pricing" className="hover:text-slate-600">Pricing</Link>
            <LanguageSwitcher />
          </div>
        </div>
      </footer>
    </div>
  );
}
