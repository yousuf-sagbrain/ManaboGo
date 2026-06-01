"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { StrokeAnimModal } from "@/components/kana/StrokeAnimModal";

// ── Kana tables ─────────────────────────────────────────────────────────────
type Cell = [string, string] | null;

const ROW_LABELS        = ["a","ka","sa","ta","na","ha","ma","ya","ra","wa","n"];
const VOICED_ROW_LABELS = ["ga","za","da","ba","pa"];
const COL_LABELS        = ["a","i","u","e","o"];
const VOW_BG = ["#ffe4e6","#fde4c7","#fef3c7","#dcfce7","#dbeafe"];
const VOW_FG = ["#be123c","#b45309","#a16207","#15803d","#1d4ed8"];

const HIRAGANA: Cell[][] = [
  [["あ","a"],  ["い","i"],  ["う","u"],  ["え","e"],  ["お","o"] ],
  [["か","ka"], ["き","ki"], ["く","ku"], ["け","ke"], ["こ","ko"]],
  [["さ","sa"], ["し","shi"],["す","su"], ["せ","se"], ["そ","so"]],
  [["た","ta"], ["ち","chi"],["つ","tsu"],["て","te"], ["と","to"]],
  [["な","na"], ["に","ni"], ["ぬ","nu"], ["ね","ne"], ["の","no"]],
  [["は","ha"], ["ひ","hi"], ["ふ","fu"], ["へ","he"], ["ほ","ho"]],
  [["ま","ma"], ["み","mi"], ["む","mu"], ["め","me"], ["も","mo"]],
  [["や","ya"], null,        ["ゆ","yu"], null,        ["よ","yo"]],
  [["ら","ra"], ["り","ri"], ["る","ru"], ["れ","re"], ["ろ","ro"]],
  [["わ","wa"], null,        null,        null,        ["を","wo"]],
  [["ん","n"],  null,        null,        null,        null       ],
];
const KATAKANA: Cell[][] = [
  [["ア","a"],  ["イ","i"],  ["ウ","u"],  ["エ","e"],  ["オ","o"] ],
  [["カ","ka"], ["キ","ki"], ["ク","ku"], ["ケ","ke"], ["コ","ko"]],
  [["サ","sa"], ["シ","shi"],["ス","su"], ["セ","se"], ["ソ","so"]],
  [["タ","ta"], ["チ","chi"],["ツ","tsu"],["テ","te"], ["ト","to"]],
  [["ナ","na"], ["ニ","ni"], ["ヌ","nu"], ["ネ","ne"], ["ノ","no"]],
  [["ハ","ha"], ["ヒ","hi"], ["フ","fu"], ["ヘ","he"], ["ホ","ho"]],
  [["マ","ma"], ["ミ","mi"], ["ム","mu"], ["メ","me"], ["モ","mo"]],
  [["ヤ","ya"], null,        ["ユ","yu"], null,        ["ヨ","yo"]],
  [["ラ","ra"], ["リ","ri"], ["ル","ru"], ["レ","re"], ["ロ","ro"]],
  [["ワ","wa"], null,        null,        null,        ["ヲ","wo"]],
  [["ン","n"],  null,        null,        null,        null       ],
];
const HIRAGANA_VOICED: Cell[][] = [
  [["が","ga"],["ぎ","gi"],["ぐ","gu"],["げ","ge"],["ご","go"]],
  [["ざ","za"],["じ","ji"],["ず","zu"],["ぜ","ze"],["ぞ","zo"]],
  [["だ","da"],["ぢ","di"],["づ","du"],["で","de"],["ど","do"]],
  [["ば","ba"],["び","bi"],["ぶ","bu"],["べ","be"],["ぼ","bo"]],
  [["ぱ","pa"],["ぴ","pi"],["ぷ","pu"],["ぺ","pe"],["ぽ","po"]],
];
const KATAKANA_VOICED: Cell[][] = [
  [["ガ","ga"],["ギ","gi"],["グ","gu"],["ゲ","ge"],["ゴ","go"]],
  [["ザ","za"],["ジ","ji"],["ズ","zu"],["ゼ","ze"],["ゾ","zo"]],
  [["ダ","da"],["ヂ","di"],["ヅ","du"],["デ","de"],["ド","do"]],
  [["バ","ba"],["ビ","bi"],["ブ","bu"],["ベ","be"],["ボ","bo"]],
  [["パ","pa"],["ピ","pi"],["プ","pu"],["ペ","pe"],["ポ","po"]],
];

// ── Practice modes ────────────────────────────────────────────────────────────
const PRACTICE_MODES = [
  { href: "/kana/typing",          icon: "⌨️", label: "Typing Practice",   desc: "Type the romaji for each character shown",            color: "var(--sakura)" },
  { href: "/kana/multiple-choice", icon: "🎯", label: "Multiple Choice",   desc: "Pick the correct reading from 4 options",             color: "#6366f1"       },
  { href: "/kana/match",           icon: "🔗", label: "Script Matching",   desc: "Match hiragana ↔ katakana characters",                color: "#0ea5e9"       },
  { href: "/kana/listening",       icon: "🎧", label: "Listening Practice",desc: "Hear the audio and identify the character",           color: "#10b981"       },
  { href: "/kana/time-attack",     icon: "⚡", label: "Time Attack",       desc: "5 seconds per character — don't lose all 5 hearts",  color: "#f59e0b"       },
];

// ── Kana grid ─────────────────────────────────────────────────────────────────
function KanaGrid({ grid, rowLabels, onSelect }: { grid: Cell[][]; rowLabels: string[]; onSelect: (c: string, r: string) => void }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: 280 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.75rem repeat(5,1fr)", gap: 4, marginBottom: 4 }}>
          <div />
          {COL_LABELS.map((l, ci) => (
            <div key={l} style={{ textAlign: "center", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: VOW_FG[ci], padding: "2px 0" }}>{l}</div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {grid.map((row, ri) => (
            <div key={ri} style={{ display: "grid", gridTemplateColumns: "1.75rem repeat(5,1fr)", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, textTransform: "uppercase", color: "var(--muted)" }}>{rowLabels[ri]}</div>
              {row.map((cell, ci) => cell ? (
                <button key={ci} type="button" onClick={() => onSelect(cell[0], cell[1])}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, padding: "10px 4px", borderRadius: 10, background: VOW_BG[ci], border: "none", cursor: "pointer", transition: "transform 0.12s cubic-bezier(0.34,1.56,0.64,1)", minHeight: 44 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px) scale(1.07)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "none"; }}>
                  <span lang="ja" style={{ fontSize: 20, fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 700, lineHeight: 1, color: VOW_FG[ci] }}>{cell[0]}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: VOW_FG[ci], opacity: 0.7 }}>{cell[1]}</span>
                </button>
              ) : (
                <div key={ci} style={{ borderRadius: 10, background: "#eef1f7", opacity: 0.35 }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Practice dropdown ─────────────────────────────────────────────────────────
function PracticeDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 20px", borderRadius: 14, border: "1.5px solid var(--sakura)", background: "var(--sakura)", color: "#fff", fontFamily: "var(--font-display), Nunito, sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer", transition: "opacity 0.15s", whiteSpace: "nowrap" }}
      >
        Practice ▾
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 280, background: "var(--surface)", borderRadius: 16, border: "1.5px solid var(--border)", boxShadow: "0 8px 32px rgba(26,31,60,0.14)", zIndex: 50, overflow: "hidden" }}>
          {PRACTICE_MODES.map((m, i) => (
            <Link key={m.href} href={m.href}
              onClick={() => setOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", textDecoration: "none", borderBottom: i < PRACTICE_MODES.length - 1 ? "1px solid var(--border)" : "none", transition: "background 0.1s" }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface-2)"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "transparent"}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${m.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{m.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)", fontFamily: "var(--font-display), Nunito, sans-serif" }}>{m.label}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{m.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
type Script = "hiragana" | "katakana" | null;

const SCRIPT_CARDS = [
  { id: "hiragana" as const, title: "Hiragana", desc: "46 base + 25 voiced = 71 characters · primary script", sample: "あいうえお", color: "var(--sakura)", tint: "var(--tint-red)" },
  { id: "katakana" as const, title: "Katakana", desc: "46 base + 25 voiced = 71 characters · foreign words", sample: "アイウエオ", color: "#6366f1",       tint: "#eef2ff"         },
];

const revealAnim = `@keyframes kana-reveal { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }`;

export default function KanaHubPage() {
  const [activeScript, setActiveScript] = useState<Script>(null);
  const [selected, setSelected] = useState<{ char: string; romaji: string } | null>(null);

  const grid       = activeScript === "hiragana" ? HIRAGANA        : KATAKANA;
  const voicedGrid = activeScript === "hiragana" ? HIRAGANA_VOICED : KATAKANA_VOICED;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "36px 20px 60px", fontFamily: "var(--font-body), DM Sans, sans-serif" }}>
      <style>{revealAnim}</style>

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", margin: "0 0 5px" }}>Phase 1 · Kana Mastery</p>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", margin: "0 0 5px", fontFamily: "var(--font-display), Nunito, sans-serif" }}>Kana Practice</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Learn hiragana and katakana. Click any character to see its stroke order.</p>
        </div>
        <PracticeDropdown />
      </div>

      {/* Script cards */}
      <div style={{ display: "flex", gap: 14, marginBottom: 32 }}>
        {SCRIPT_CARDS.map(s => {
          const active = activeScript === s.id;
          return (
            <button key={s.id} type="button"
              onClick={() => setActiveScript(active ? null : s.id)}
              style={{
                flex: 1, padding: "20px 18px", borderRadius: 18, cursor: "pointer", textAlign: "left",
                background: active ? s.tint : "var(--surface)",
                borderTopWidth: 2, borderRightWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4,
                borderStyle: "solid",
                borderTopColor: active ? s.color : "var(--border)",
                borderRightColor: active ? s.color : "var(--border)",
                borderLeftColor: active ? s.color : "var(--border)",
                borderBottomColor: active ? s.color : "var(--border)",
                boxShadow: active ? `0 4px 20px 0 ${s.color}28` : "0 2px 8px 0 rgba(26,31,60,0.05)",
                transition: "border-color 0.15s, background 0.15s, box-shadow 0.15s",
              }}
            >
              <div style={{ fontSize: 26, fontFamily: "'Noto Sans JP', sans-serif", letterSpacing: "0.1em", color: active ? s.color : "var(--ink)", marginBottom: 8, fontWeight: 700 }}>{s.sample}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: active ? s.color : "var(--ink)", fontFamily: "var(--font-display), Nunito, sans-serif", marginBottom: 3 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>{s.desc}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: active ? s.color : "var(--muted)" }}>{active ? "▲ Hide chart" : "▼ Show chart"}</div>
            </button>
          );
        })}
      </div>

      {/* Chart panel */}
      {activeScript && (
        <div style={{ animation: "kana-reveal 0.2s ease forwards" }}>

          <div style={{ background: "var(--surface)", borderTopWidth: 2, borderRightWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4, borderStyle: "solid", borderTopColor: "var(--border)", borderRightColor: "var(--border)", borderLeftColor: "var(--border)", borderBottomColor: "#c3cbdc", borderRadius: 18, padding: "20px 18px", marginBottom: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted)", margin: "0 0 14px" }}>Base characters (a → n)</p>
            <KanaGrid grid={grid} rowLabels={ROW_LABELS} onSelect={(c, r) => setSelected({ char: c, romaji: r })} />
          </div>

          <div style={{ background: "var(--surface)", borderTopWidth: 2, borderRightWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4, borderStyle: "solid", borderTopColor: "var(--border)", borderRightColor: "var(--border)", borderLeftColor: "var(--border)", borderBottomColor: "#c3cbdc", borderRadius: 18, padding: "20px 18px", marginBottom: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted)", margin: "0 0 14px" }}>Voiced &amp; semi-voiced</p>
            <KanaGrid grid={voicedGrid} rowLabels={VOICED_ROW_LABELS} onSelect={(c, r) => setSelected({ char: c, romaji: r })} />
          </div>

          <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center" }}>
            Click any character to see its stroke order animation and hear the pronunciation.
          </p>
        </div>
      )}

      <StrokeAnimModal character={selected?.char ?? null} romaji={selected?.romaji} onClose={() => setSelected(null)} />
    </div>
  );
}
