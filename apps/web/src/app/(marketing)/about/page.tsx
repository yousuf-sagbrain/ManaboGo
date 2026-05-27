import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — ManaboGo",
  description: "The story behind ManaboGo — the world's first platform with an accredited online JLPT N5 certificate.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold text-slate-900 font-display mb-6">About ManaboGo</h1>
      <div className="prose prose-slate max-w-none">
        <p className="text-xl text-slate-500 leading-relaxed mb-8">
          ManaboGo is a global Japanese language learning platform designed to help learners
          achieve JLPT N5 proficiency and earn a verifiable certificate — entirely online.
        </p>
        <p className="text-slate-600 leading-relaxed mb-6">
          We combine proven spaced repetition science with AI-powered progress analytics,
          real-time competitive learning, and a supportive global community spanning 30+ countries.
          Our target learners include Southeast Asian diaspora communities, anime and manga fans,
          business travellers, and anyone who wants to begin their Japanese journey with a structured,
          accredited curriculum.
        </p>
        <p className="text-slate-600 leading-relaxed">
          ManaboGo supports learners in their native languages — English, Japanese, Bengali,
          Bahasa Indonesia, and Vietnamese — ensuring that language barriers never stand between
          a learner and their goals.
        </p>
      </div>
    </div>
  );
}
