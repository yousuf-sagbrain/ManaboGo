"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────
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

type Phase = "idle" | "correct" | "wrong";

const SRS_GRADES = [
  { label: "Again", sub: "<1m", grade: 0, color: "var(--coral)",   bg: "var(--coral-tint)"   },
  { label: "Hard",  sub: "6m",  grade: 1, color: "var(--amber)",   bg: "var(--amber-tint)"   },
  { label: "Good",  sub: "1d",  grade: 2, color: "var(--accent)",  bg: "var(--accent-tint)"  },
  { label: "Easy",  sub: "4d",  grade: 3, color: "var(--sage)",    bg: "var(--sage-tint)"    },
];

// ── Page ───────────────────────────────────────────────────────
export default function LearnPage() {
  const [queue,       setQueue]       = useState<ReviewCard[]>([]);
  const [answers,     setAnswers]     = useState<string[]>([]);
  const [correctIdx,  setCorrectIdx]  = useState(0);
  const [idx,         setIdx]         = useState(0);
  const [selected,    setSelected]    = useState<number | null>(null);
  const [phase,       setPhase]       = useState<Phase>("idle");
  const [xp,          setXp]          = useState(0);
  const [xpBurst,     setXpBurst]     = useState(false);
  const [shaking,     setShaking]     = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [totalDue,    setTotalDue]    = useState(0);
  const [sessionDone, setSessionDone] = useState(false);

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
    const opts = [correct, ...pool.sort(() => Math.random() - 0.5).slice(0, 3)].sort(() => Math.random() - 0.5);
    setAnswers(opts);
    setCorrectIdx(opts.indexOf(correct));
    setSelected(null);
    setPhase("idle");
    setShaking(false);
  };

  const handleAnswer = useCallback((ansIdx: number) => {
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
      setTimeout(() => setShaking(false), 500);
    }
  }, [phase, correctIdx, queue]);

  const handleGrade = useCallback(async (grade: number) => {
    if (queue.length === 0) return;
    const card = queue[idx];
    const earned = [0, 5, 10, 15][grade] ?? 0;
    try {
      const res = await apiFetch<{ xp_earned: number }>(`/content/grade?vocab_id=${card.vocab.id}`, { method: "POST", body: JSON.stringify({ grade }) });
      setXp((prev) => prev + res.xp_earned);
    } catch {
      setXp((prev) => prev + earned);
    }
    const next = idx + 1;
    if (next >= queue.length) { setSessionDone(true); }
    else { setIdx(next); prepareCard(queue, next); }
  }, [idx, queue]);

  const handleNext = useCallback(() => {
    handleGrade(phase === "correct" ? 2 : 0);
  }, [handleGrade, phase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "1") handleAnswer(0);
      else if (e.key === "2") handleAnswer(1);
      else if (e.key === "3") handleAnswer(2);
      else if (e.key === "4") handleAnswer(3);
      else if ((e.key === "Enter" || e.key === " ") && phase !== "idle") handleNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleAnswer, handleNext, phase]);

  const card       = queue[idx];
  const cardsDone  = idx + (phase !== "idle" ? 1 : 0);
  const pct        = queue.length > 0 ? Math.round((cardsDone / queue.length) * 100) : 0;
  const isAnswered = phase === "correct" || phase === "wrong";

  // ── States ─────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh", background: "var(--base)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-jp)", fontSize: 48, marginBottom: 16, color: "var(--ink-subtle)" }}>学</div>
        <div style={{ fontSize: 14, color: "var(--ink-muted)" }}>Loading your review queue…</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh", background: "var(--base)" }}>
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <div style={{ fontSize: 14, color: "var(--coral)", marginBottom: 16 }}>{error}</div>
        <button onClick={loadQueue} className="btn btn-primary" style={{ borderRadius: 12 }}>Retry</button>
      </div>
    </div>
  );

  if (sessionDone || !card) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100dvh", background: "var(--base)", gap: 20 }}>
      <div style={{ fontFamily: "var(--font-jp)", fontSize: 64 }}>完</div>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "var(--ink)", margin: "0 0 8px 0", textAlign: "center" }}>Session complete!</h2>
        <p style={{ fontSize: 14, color: "var(--ink-muted)", textAlign: "center", margin: 0 }}>
          You earned <strong style={{ color: "var(--accent)" }}>+{xp} XP</strong> this session.
          {totalDue > 0 ? ` ${totalDue} cards still due.` : " All caught up!"}
        </p>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <a href="/dashboard" className="btn btn-ghost" style={{ borderRadius: 12 }}>Dashboard</a>
        <button onClick={() => { setSessionDone(false); setXp(0); loadQueue(); }} className="btn btn-primary" style={{ borderRadius: 12 }}>
          Study more
        </button>
      </div>
    </div>
  );

  // ── Main lesson UI ─────────────────────────────────────────
  const cardBg      = phase === "correct" ? "var(--sage-tint)"  : phase === "wrong" ? "var(--coral-tint)"  : "var(--surface)";
  const cardBorder  = phase === "correct" ? "var(--sage)"       : phase === "wrong" ? "var(--coral)"       : "var(--border-soft)";

  return (
    <div className="fullscreen-page" style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "var(--base)", overflow: "hidden" }}>

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: "var(--surface)", borderBottom: "1px solid var(--border-soft)", flexShrink: 0 }}>
        <a href="/dashboard" aria-label="Exit lesson" style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid var(--border-soft)", background: "var(--base-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "var(--ink-muted)", textDecoration: "none", flexShrink: 0 }}>
          ✕
        </a>
        <div className="progress-track" style={{ flex: 1 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--amber)", flexShrink: 0, display: "flex", alignItems: "center", gap: 5 }}>
          🔥 {Math.floor(xp / 100)}
        </div>
      </div>

      {/* Card area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", gap: 20, overflowY: "auto" }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-muted)", letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>
          {cardsDone} / {queue.length} · {card.progress ? `SRS Level ${card.progress.srs_level}` : "New word"}
        </p>

        {/* Vocab card */}
        <div
          style={{
            background: cardBg,
            border: `2px solid ${cardBorder}`,
            borderRadius: 20,
            padding: "clamp(24px, 5vw, 36px) clamp(20px, 6vw, 44px)",
            width: "100%",
            maxWidth: 480,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            boxShadow: "var(--shadow-card-md)",
            animation: shaking ? "shake 500ms ease-in-out" : "none",
            transition: "background 0.2s, border-color 0.2s",
          }}
        >
          <div style={{ position: "absolute", top: 14, left: 14, right: 14, display: "flex", justifyContent: "space-between" }}>
            <button aria-label="Play pronunciation" style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border-soft)", background: "var(--base-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "var(--ink-muted)" }}>🔊</button>
            <button aria-label="Stroke order" style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border-soft)", background: "var(--base-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "var(--ink-muted)" }}>✏️</button>
          </div>

          <div style={{ fontFamily: "var(--font-jp)", fontSize: "clamp(56px, 15vw, 72px)", fontWeight: 700, color: "var(--ink)", lineHeight: 1.1, marginTop: 24, marginBottom: 10, userSelect: "none" }}>
            {card.vocab.kanji}
          </div>
          <div style={{ fontFamily: "var(--font-jp)", fontSize: 18, color: "var(--ink-muted)", marginBottom: 16, userSelect: "none" }}>
            {card.vocab.reading}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Choose the meaning
          </div>
        </div>

        {/* Answer grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%", maxWidth: 480 }}>
          {answers.map((answer, i) => {
            const isCorrect  = i === correctIdx;
            const isSelected = i === selected;
            let bg = "var(--surface)", border = "var(--border-soft)", color = "var(--ink-soft)", icon = null as string | null;

            if (isAnswered) {
              if (isCorrect)  { bg = "var(--sage-tint)";  border = "var(--sage)";  color = "var(--sage-hover)"; icon = "✓"; }
              if (isSelected && !isCorrect) { bg = "var(--coral-tint)"; border = "var(--coral)"; color = "var(--coral)"; icon = "✗"; }
            }

            return (
              <button key={i} onClick={() => handleAnswer(i)} disabled={isAnswered}
                style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, cursor: isAnswered ? "default" : "pointer", transition: "background 0.18s, border-color 0.18s", textAlign: "left", width: "100%", boxShadow: isAnswered ? "none" : "var(--shadow-card)" }}
                onMouseEnter={(e) => { if (!isAnswered) (e.currentTarget as HTMLElement).style.background = "var(--base)"; }}
                onMouseLeave={(e) => { if (!isAnswered) (e.currentTarget as HTMLElement).style.background = bg; }}
              >
                <span style={{ width: 22, height: 22, borderRadius: 6, background: isAnswered ? "transparent" : "var(--base-2)", border: isAnswered ? "none" : "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: isAnswered ? color : "var(--ink-subtle)", flexShrink: 0 }}>
                  {isAnswered && icon ? icon : i + 1}
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color, lineHeight: 1.4 }}>{answer}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {isAnswered && (
          <div className="animate-slide-up" style={{ fontSize: 13, fontWeight: 600, color: phase === "correct" ? "var(--sage)" : "var(--coral)", display: "flex", alignItems: "center", gap: 6, textAlign: "center", maxWidth: 480 }}>
            {phase === "correct"
              ? `Correct! ${card.vocab.example_en ? `"${card.vocab.example_en}"` : "+10 XP"}`
              : `The answer was "${card.vocab.meaning}". ${card.vocab.example_jp ?? ""}`}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{ background: "var(--surface)", borderTop: "1px solid var(--border-soft)", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
        {/* XP bar */}
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 12, fontWeight: 600, color: "var(--ink-muted)" }}>
            <span>Session XP · {xp}</span>
            {xpBurst && (
              <span style={{ position: "absolute", right: 0, top: -4, fontSize: 12, fontWeight: 700, color: "var(--sage)", animation: "xpBurst 0.9s var(--ease-spring) forwards", pointerEvents: "none" }}>
                +10 XP
              </span>
            )}
          </div>
          <div className="progress-track" style={{ height: 6 }}>
            <div className="progress-fill progress-fill-sage" style={{ width: `${Math.min((xp % 500) / 5, 100)}%` }} />
          </div>
        </div>

        {/* Grade buttons + Next */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div className="grade-row">
            {SRS_GRADES.map((g) => (
              <button key={g.label} onClick={() => handleGrade(g.grade)} disabled={!isAnswered}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 14px", borderRadius: 10, border: `1.5px solid ${isAnswered ? g.color : "var(--border-soft)"}`, background: isAnswered ? g.bg : "var(--base-2)", cursor: isAnswered ? "pointer" : "default", gap: 2, opacity: isAnswered ? 1 : 0.45, pointerEvents: isAnswered ? "auto" : "none", transition: "opacity 0.2s, border-color 0.2s, background 0.2s", minWidth: 60, flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: isAnswered ? g.color : "var(--ink-muted)", fontFamily: "var(--font-display)" }}>{g.label}</span>
                <span style={{ fontSize: 10, color: isAnswered ? g.color : "var(--ink-subtle)", opacity: 0.8 }}>{g.sub}</span>
              </button>
            ))}
          </div>
          {isAnswered && (
            <button onClick={handleNext} className="btn btn-primary" style={{ borderRadius: 12, flexShrink: 0 }}>
              {phase === "correct" ? "Got it →" : "Next →"}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(6px); }
          40% { transform: translateX(-6px); }
          60% { transform: translateX(4px); }
          80% { transform: translateX(-4px); }
        }
        @keyframes xpBurst {
          0%   { opacity: 0; transform: translateY(0); }
          20%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(-28px); }
        }
      `}</style>
    </div>
  );
}
