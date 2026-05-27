/**
 * / — Landing page (SSG — public, SEO).
 * Server Component.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "ManaboGo — Learn Japanese for JLPT N5",
  description:
    "ManaboGo is the first platform offering an accredited online JLPT N5 certificate. Adaptive SRS, AI-powered readiness reports, and a global learner community across 30+ countries.",
  openGraph: {
    title: "ManaboGo — Learn Japanese for JLPT N5",
    description:
      "Adaptive SRS · Readiness Reports · N5 Certification · Gamification. Start free today.",
    images: ["/og-home.png"],
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-sakura font-display">ManaboGo</span>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
            <Link href="/about" className="hover:text-slate-900 transition-colors">About</Link>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="bg-sakura text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg hover:brightness-105 transition-all"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-pink-50 border border-sakura/20 rounded-full px-4 py-1.5 text-sm font-semibold text-sakura mb-6">
          🎌 Now offering accredited JLPT N5 certificates
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 font-display leading-tight mb-6">
          Learn Japanese.<br />
          <span className="text-sakura">Earn your N5.</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
          The world&apos;s most engaging JLPT N5 prep platform — with adaptive SRS, AI-powered
          readiness reports, real-time battles, and the first online-accredited N5 certificate.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/register"
            className="bg-sakura text-white px-8 py-3.5 rounded-xl text-base font-bold shadow-md hover:shadow-lg hover:brightness-105 active:translate-y-0.5 transition-all"
          >
            Start Free — No Card Required
          </Link>
          <Link
            href="/pricing"
            className="bg-white border border-slate-200 text-slate-700 px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-slate-50 transition-colors"
          >
            See Pricing
          </Link>
        </div>
      </section>

      {/* Social proof */}
      <section className="bg-white border-y border-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { stat: "50,000+", label: "Active learners" },
              { stat: "30+", label: "Countries" },
              { stat: "2,100+", label: "Certificates issued" },
            ].map(({ stat, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold text-sakura font-display">{stat}</p>
                <p className="text-sm text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-slate-900 font-display text-center mb-12">
          Everything you need to pass JLPT N5
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              emoji: "🧠",
              title: "Adaptive SRS",
              desc: "Spaced repetition that adjusts to your forgetting curve — Kana, Kanji, Vocabulary, Grammar.",
            },
            {
              emoji: "📊",
              title: "Readiness Report",
              desc: "5-component AI analysis of your N5 readiness. Know exactly where to focus.",
            },
            {
              emoji: "🏆",
              title: "N5 Certification",
              desc: "The first platform offering an accredited online JLPT N5 certificate, verifiable by employers.",
            },
            {
              emoji: "⚔️",
              title: "Gamification",
              desc: "Vocabulary battles, XP streaks, Sakura Coins, and a global leaderboard.",
            },
          ].map(({ emoji, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="text-3xl mb-3">{emoji}</div>
              <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing preview */}
      <section className="bg-white border-y border-slate-100 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 font-display mb-4">Simple pricing</h2>
          <p className="text-slate-500 mb-10">
            Start free forever. Upgrade when you need unlimited practice and N5 certification.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Free */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Free</p>
              <p className="text-3xl font-bold text-slate-900 mb-4">$0 <span className="text-sm font-normal text-slate-400">/ month</span></p>
              <ul className="space-y-2 text-sm text-slate-600 mb-6">
                {["Kana + Basic Vocabulary SRS", "1 Quick Mock / week", "10 Async Battles / week", "Progress tracking"].map((f) => (
                  <li key={f} className="flex items-center gap-2"><span className="text-jade">✓</span>{f}</li>
                ))}
              </ul>
              <Link href="/register" className="block text-center bg-slate-900 text-white rounded-xl py-2.5 font-semibold hover:bg-slate-800 transition-colors">
                Get started free
              </Link>
            </div>
            {/* Pro */}
            <div className="bg-sakura rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-white/20 rounded-full px-3 py-1 text-xs font-bold">POPULAR</div>
              <p className="text-sm font-semibold uppercase tracking-wide mb-2 opacity-80">Pro</p>
              <p className="text-3xl font-bold mb-1">$12 <span className="text-sm font-normal opacity-70">/ month</span></p>
              <p className="text-xs opacity-70 mb-4">Prices adjusted for your region (PPP)</p>
              <ul className="space-y-2 text-sm mb-6">
                {["Everything in Free", "Unlimited SRS + Mocks", "Full Readiness Report", "Real-time sync battles", "N5 Certification attempt", "Offline mode"].map((f) => (
                  <li key={f} className="flex items-center gap-2"><span>✓</span>{f}</li>
                ))}
              </ul>
              <Link href="/register?plan=pro" className="block text-center bg-white text-sakura rounded-xl py-2.5 font-bold hover:bg-pink-50 transition-colors">
                Get Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-10 flex items-center justify-between text-sm text-slate-400">
        <p>© 2026 ManaboGo. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/about" className="hover:text-slate-600">About</Link>
          <Link href="/pricing" className="hover:text-slate-600">Pricing</Link>
          <LanguageSwitcher />
        </div>
      </footer>
    </div>
  );
}
