import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — ManaboGo",
  description:
    "Free forever or upgrade to Pro for unlimited practice, mock tests, and N5 certification. Prices automatically adjusted for your region.",
};

export default function PricingPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 font-display mb-4">Simple, fair pricing</h1>
        <p className="text-xl text-slate-500">
          Start free. Upgrade to Pro when you&apos;re ready to go all-in on N5.
        </p>
        <p className="text-sm text-amber-600 font-medium mt-2 bg-amber-50 inline-block px-3 py-1 rounded-full border border-amber-200">
          🌍 Prices automatically adjusted for your region (Purchasing Power Parity)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Free tier */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Free</h2>
          <p className="text-sm text-slate-500 mb-4">Perfect for getting started</p>
          <p className="text-4xl font-bold text-slate-900 mb-6">
            $0 <span className="text-sm font-normal text-slate-400">/ month</span>
          </p>
          <ul className="space-y-3 text-sm text-slate-600 mb-8">
            {[
              "Kana mastery (Hiragana + Katakana)",
              "N5 Vocabulary SRS — 800 words",
              "Basic Grammar SRS",
              "1 Quick Mock per week",
              "1 Full Section Mock per month",
              "10 Async Vocabulary Battles per week",
              "Progress tracking & streaks",
              "Community access",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="text-jade mt-0.5 flex-shrink-0">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className="block text-center bg-slate-900 text-white rounded-xl py-3 font-semibold hover:bg-slate-800 transition-colors"
          >
            Get started free
          </Link>
        </div>

        {/* Pro tier */}
        <div className="bg-sakura rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
          <div className="absolute top-6 right-6 bg-white/20 rounded-full px-3 py-1 text-xs font-bold">
            MOST POPULAR
          </div>
          <h2 className="text-lg font-bold mb-1">Pro</h2>
          <p className="text-sm opacity-80 mb-4">For serious N5 candidates</p>
          <p className="text-4xl font-bold mb-1">
            $12 <span className="text-sm font-normal opacity-70">/ month</span>
          </p>
          <p className="text-xs opacity-60 mb-6">
            or $96/year (save 33%) · PPP pricing applied at checkout
          </p>
          <ul className="space-y-3 text-sm mb-8">
            {[
              "Everything in Free",
              "Unlimited SRS practice",
              "Unlimited Mock tests",
              "Full 5-component Readiness Report",
              "Real-time Sync Battles",
              "Unlimited Async Battles",
              "Offline mode",
              "N5 Certification attempt",
              "Priority support",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="opacity-90 mt-0.5 flex-shrink-0">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/register?plan=pro"
            className="block text-center bg-white text-sakura rounded-xl py-3 font-bold hover:bg-pink-50 transition-colors"
          >
            Get Pro
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-slate-900 font-display mb-6 text-center">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {[
            {
              q: "What is PPP pricing?",
              a: "Purchasing Power Parity pricing means we adjust the Pro price based on your country's economic conditions. Learners in lower-income countries pay significantly less — sometimes up to 70% off.",
            },
            {
              q: "Is the N5 certificate recognized?",
              a: "ManaboGo certificates are independently verified and recognized by a growing number of language schools and employers. They are designed to complement, not replace, the official JLPT exam.",
            },
            {
              q: "Can I cancel anytime?",
              a: "Yes. Cancel from your account settings at any time. You'll retain Pro access until the end of your billing period.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="bg-white rounded-xl border border-slate-100 p-5">
              <p className="font-semibold text-slate-900 mb-1">{q}</p>
              <p className="text-sm text-slate-500">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
