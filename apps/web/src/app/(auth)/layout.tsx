/** Auth route group layout — centered card, no nav. */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | ManaboGo",
    default: "ManaboGo",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2">
            <span className="text-2xl font-bold text-sakura font-display">
              ManaboGo
            </span>
          </a>
        </div>
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
