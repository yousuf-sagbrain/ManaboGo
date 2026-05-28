"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────────

interface VocabItem {
  id: string;
  kanji: string;
  reading: string;
  meaning: string;
  meaning_alts: string[];
  part_of_speech: string;
  tags: string[];
  example_jp: string | null;
  example_en: string | null;
}

interface ReviewCard {
  vocab: VocabItem;
  progress: {
    vocab_id: string;
    srs_level: number;
    next_review_at: string;
    review_count: number;
    correct_count: number;
  } | null;
}

interface ReviewQueueResponse {
  cards: ReviewCard[];
  total_due: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

type Phase = "idle" | "selected" | "correct" | "wrong";

const SRS_GRADES = [
  { label: "Again", sub: "<1m",  grade: 0 },
  { label: "Hard",  sub: "6m",   grade: 1 },
  { label: "Good",  sub: "1d",   grade: 2 },
  { label: "Easy",  sub: "4d",   grade: 3 },
];

/** Build 4 answer choices: correct meaning + 3 wrong ones from the queue. */
function buildAnswers(
  card: ReviewCard,
  allCards: ReviewCard[]
): { text: string; correctIdx: number } {
  const correct = card.vocab.meaning;
  const pool = allCards
    .map((c) => c.vocab.meaning)
    .filter((m) => m !== correct);
  const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [correct, ...shuffled].sort(() => Math.random() - 0.5);
  return { text: correct, correctIdx: options.indexOf(correct) };
}

const shakeKeyframes = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  15%  { transform: translateX(-8px); }
  30%  { transform: translateX(8px); }
  45%  { transform: translateX(-6px); }
  60%  { transform: translateX(6px); }
  75%  { transform: translateX(-3px); }
  90%  { transform: translateX(3px); }
}
@keyframes xpBurst {
  0%   { opacity: 1; transform: translateY(0) scale(1); }
  60%  { opacity: 1; transform: translateY(-28px) scale(1.15); }
  100% { opacity: 0; transform: translateY(-48px) scale(0.9); }
}
`;

// ── Page ───────────────────────────────────────────────────────────────────────

export default function LearnPage() {
  const [queue, setQueue] = useState<ReviewCard[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [xp, setXp] = useState(0);
  const [xpBurst, setXpBurst] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalDue, setTotalDue] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);

  // ── Load queue ─────────────────────────────────────────────
  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ReviewQueueResponse>("/content/review-queue?limit=20&include_new=true");
      if (data.cards.length === 0) {
        setSessionDone(true);
      } else {
        setQueue(data.cards);
        setTotalDue(data.total_due);
        setIdx(0);
        prepareCard(data.cards, 0);
      }
    } catch {
      setError("Could not load your review queue. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadQueue(); }, [loadQueue]);

  const prepareCard = (cards: ReviewCard[], i: number) => {
    if (cards.length < 4) return;
    const correct = cards[i].vocab.meaning;
    const pool = cards.map((c) => c.vocab.meaning).filter((m) => m !== correct);
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [correct, ...shuffled].sort(() => Math.random() - 0.5);
    setAnswers(opts);
    setCorrectIdx(opts.indexOf(correct));
    setSelected(null);
    setPhase("idle");
    setShaking(false);
  };

  // ── Answer handler ─────────────────────────────────────────
  const handleAnswer = useCallback(
    (ansIdx: number) => {
      if (phase !== "idle" || queue.length === 0) return;
      setSelected(ansIdx);
      if (ansIdx === correctIdx) {
        setPhase("correct");
        setXp((prev) => prev + 10);
        setXpBurst(true);
        setTimeout(() => setXpBurst(false), 900);
      } else {
        setPhase("wrong");
        setShaking(true);
        setTimeout(() => setShaking(false), 600);
      }
    },
    [phase, correctIdx, queue]
  );

  // ── SRS grade + advance ────────────────────────────────────
  const handleGrade = useCallback(
    async (grade: number) => {
      if (queue.length === 0) return;
      const card = queue[idx];
      const earnedXp = grade === 0 ? 0 : grade === 1 ? 5 : grade === 2 ? 10 : 15;

      try {
        const result = await apiFetch<{ xp_earned: number }>(
          `/content/grade?vocab_id=${card.vocab.id}`,
          { method: "POST", body: JSON.stringify({ grade }) }
        );
        setXp((prev) => prev + result.xp_earned);
      } catch {
        // Optimistic — don't block UI on grade failure
        setXp((prev) => prev + earnedXp);
      }

      const nextIdx = idx + 1;
      if (nextIdx >= queue.length) {
        setSessionDone(true);
      } else {
        setIdx(nextIdx);
        prepareCard(queue, nextIdx);
      }
    },
    [idx, queue]
  );

  const handleNext = useCallback(() => {
    // When user clicks "Next" without choosing a grade — default to Good (2)
    handleGrade(phase === "correct" ? 2 : 0);
  }, [handleGrade, phase]);

  // ── Keyboard shortcuts ─────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "1") handleAnswer(0);
      else if (e.key === "2") handleAnswer(1);
      else if (e.key === "3") handleAnswer(2);
      else if (e.key === "4") handleAnswer(3);
      else if ((e.key === "Enter" || e.key === "ArrowRight") && phase !== "idle") handleNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleAnswer, handleNext, phase]);

  // ── Derived ────────────────────────────────────────────────
  const card = queue[idx];
  const cardsDone = idx + (phase !== "idle" ? 1 : 0);
  const progressPct = queue.length > 0 ? Math.round((cardsDone / queue.length) * 100) : 0;
  const isAnswered = phase === "correct" || phase === "wrong";
  const cardBorderColor = phase === "correct" ? "var(--mint-soft)" : phase === "wrong" ? "var(--danger)" : "var(--border)";
  const cardBg = phase === "correct" ? "var(--tint-mint)" : phase === "wrong" ? "var(--tint-red)" : "var(--surface)";

  // ── Loading / error / empty states ─────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--page)" }}>
        <div style={{ textAlign: "center", color: "var(--muted)", fontFamily: "var(--font-body)" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🌸</div>
          Loading your review queue…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--page)" }}>
        <div style={{ textAlign: "center", maxWidth: 360 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
          <p style={{ color: "var(--danger)", fontFamily: "var(--font-body)", marginBottom: 16 }}>{error}</p>
          <button onClick={loadQueue} style={{ padding: "10px 24px", background: "var(--sakura)", color: "#fff", border: "none", borderRadius: 12, fontFamily: "var(--font-display)", fontWeight: 700, cursor: "pointer" }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (sessionDone || !card) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--page)", gap: 16 }}>
        <div style={{ fontSize: 56 }}>🎉</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "var(--ink)", margin: 0 }}>Session complete!</h2>
        <p style={{ color: "var(--muted)", fontFamily: "var(--font-body)", margin: 0 }}>
          You earned <strong style={{ color: "var(--sakura)" }}>+{xp} XP</strong> this session.
          {totalDue > 0 ? ` ${totalDue} cards still due.` : " All caught up!"}
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <a href="/dashboard" style={{ padding: "11px 24px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--surface)", color: "var(--ink)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            Dashboard
          </a>
          <button onClick={() => { setSessionDone(false); setXp(0); loadQueue(); }}
            style={{ padding: "11px 24px", borderRadius: 12, border: "none", background: "var(--sakura)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            Study more
          </button>
        </div>
      </div>
    );
  }

  // ── Main UI ────────────────────────────────────────────────
  return (
    <>
      <style>{shakeKeyframes}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--page)", fontFamily: "var(--font-body), DM Sans, sans-serif", overflow: "hidden" }}>

        {/* ── Top bar ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 24px", background: "var(--surface)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <a href="/dashboard" aria-label="Close lesson" style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "var(--muted)", flexShrink: 0, textDecoration: "none" }}>
            ✕
          </a>
          <div style={{ flex: 1, height: 10, borderRadius: 99, background: "var(--border)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progressPct}%`, background: "var(--sakura)", borderRadius: 99, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--ink)", flexShrink: 0 }}>
            🔥 {Math.floor(xp / 100)}
          </div>
        </div>

        {/* ── Center area ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", gap: 24, overflowY: "auto" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.04em", textTransform: "uppercase", margin: 0 }}>
            {cardsDone} / {queue.length} · {card.progress ? `SRS ${card.progress.srs_level}` : "New card"}
          </p>

          {/* Main card */}
          <div
            style={{ background: cardBg, border: `2px solid ${cardBorderColor}`, borderRadius: 20, padding: "32px 40px", width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", animation: shaking ? "shake 0.6s ease" : "none", transition: "background 0.25s, border-color 0.25s", boxShadow: "0 2px 16px 0 rgba(26,31,60,0.07)" }}
          >
            <div style={{ position: "absolute", top: 14, left: 14, right: 14, display: "flex", justifyContent: "space-between" }}>
              <button aria-label="Play audio" style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🔊</button>
              <button aria-label="Show stroke order" style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>✏️</button>
            </div>

            <div style={{ fontFamily: "var(--font-jp), 'Noto Sans JP', sans-serif", fontSize: 72, fontWeight: 700, color: "var(--ink)", lineHeight: 1.1, marginTop: 28, marginBottom: 8, userSelect: "none" }}>
              {card.vocab.kanji}
            </div>
            <div style={{ fontFamily: "var(--font-jp), 'Noto Sans JP', sans-serif", fontSize: 20, color: "var(--muted)", marginBottom: 16, userSelect: "none" }}>
              {card.vocab.reading}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.03em" }}>
              Choose the meaning
            </div>
          </div>

          {/* Answer chips */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%", maxWidth: 480 }}>
            {answers.map((answer, i) => {
              const isCorrect = i === correctIdx;
              const isSelected = i === selected;
              let chipBg = "var(--surface)";
              let chipBorder = "var(--border)";
              let chipColor = "var(--ink)";
              let icon: string | null = null;

              if (isAnswered) {
                if (isCorrect) { chipBg = "var(--tint-mint)"; chipBorder = "var(--mint-soft)"; chipColor = "#047857"; icon = "✓"; }
                else if (isSelected) { chipBg = "var(--tint-red)"; chipBorder = "var(--danger)"; chipColor = "var(--danger)"; icon = "✗"; }
              }

              return (
                <button key={i} onClick={() => handleAnswer(i)} disabled={isAnswered}
                  style={{ background: chipBg, border: `1.5px solid ${chipBorder}`, borderRadius: 12, padding: "14px 18px", display: "flex", flexDirection: "row", alignItems: "center", gap: 10, cursor: isAnswered ? "default" : "pointer", transition: "background 0.2s, border-color 0.2s", textAlign: "left", width: "100%" }}>
                  <span style={{ width: 22, height: 22, borderRadius: 5, background: isAnswered ? "transparent" : "#E8E8E8", border: isAnswered ? "none" : "1px solid #D0D0D0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: isAnswered ? chipColor : "#555", flexShrink: 0 }}>
                    {isAnswered && icon ? icon : String(i + 1)}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: chipColor, fontFamily: "var(--font-body), DM Sans, sans-serif" }}>{answer}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {isAnswered && (
            <div style={{ fontSize: 14, fontWeight: 600, color: phase === "correct" ? "var(--mint-soft)" : "var(--danger)", display: "flex", alignItems: "center", gap: 6 }}>
              {phase === "correct"
                ? `You got it! ${card.vocab.example_en ? `"${card.vocab.example_en}"` : "+10 XP"}`
                : `The answer was "${card.vocab.meaning}". ${card.vocab.example_jp ?? ""}`}
            </div>
          )}
        </div>

        {/* ── Bottom bar ── */}
        <div style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
              <span>Session XP · {xp}</span>
              {xpBurst && (
                <span style={{ position: "absolute", right: 0, top: -4, fontSize: 13, fontWeight: 700, color: "var(--mint-soft)", animation: "xpBurst 0.9s ease forwards", pointerEvents: "none" }}>+10 XP</span>
              )}
            </div>
            <div style={{ height: 8, borderRadius: 99, background: "var(--border)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min((xp % 500) / 5, 100)}%`, background: "var(--sakura)", borderRadius: 99, transition: "width 0.4s ease" }} />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 8, flex: 1, flexWrap: "wrap" }}>
              {SRS_GRADES.map((g) => (
                <button key={g.label} onClick={() => handleGrade(g.grade)} disabled={!isAnswered}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 16px", borderRadius: 10, border: "1.5px solid var(--border)", background: "var(--surface-2)", cursor: isAnswered ? "pointer" : "default", gap: 2, opacity: isAnswered ? 1 : 0.45, pointerEvents: isAnswered ? "auto" : "none", transition: "opacity 0.2s" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", fontFamily: "var(--font-display), Nunito, sans-serif" }}>{g.label}</span>
                  <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>{g.sub}</span>
                </button>
              ))}
            </div>
            {isAnswered && (
              <button onClick={handleNext} style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: "var(--sakura)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-display), Nunito, sans-serif", letterSpacing: "0.02em", whiteSpace: "nowrap", transition: "opacity 0.15s", flexShrink: 0 }}>
                {phase === "correct" ? "Got it →" : "Next →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
