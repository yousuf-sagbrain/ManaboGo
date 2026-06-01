"use client";

import { useState } from "react";
import Link from "next/link";
import { useKanaMatch, type MatchDirection } from "@/hooks/useKanaMatch";
import { usePronunciation } from "@/hooks/usePronunciation";
import type { KanaChar } from "@/data/kana/types";

const DIRECTIONS: { value: MatchDirection; label: string }[] = [
  { value: "hira-to-kata", label: "Hiragana → Katakana" },
  { value: "kata-to-hira", label: "Katakana → Hiragana" },
];

const anims = `@keyframes km-pop { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }`;

function Option({ opt, state, chosen, correct, onSelect }: {
  opt: KanaChar; state: "answering"|"correct"|"incorrect";
  chosen: KanaChar|null; correct: KanaChar; onSelect:(c:KanaChar)=>void;
}) {
  const answered = state !== "answering";
  const isCorrect = opt.char === correct.char;
  const isChosen  = chosen?.char === opt.char;
  let bg="#fff", bc="var(--border)", color="var(--ink)";
  if (answered) {
    if (isCorrect)     { bg="#f0fdf4"; bc="#4ade80"; color="#15803d"; }
    else if (isChosen) { bg="#fff1f2"; bc="#f87171"; color="#be123c"; }
    else               { color="var(--muted)"; }
  }
  return (
    <button type="button" disabled={answered} onClick={() => onSelect(opt)}
      style={{ height:96, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:16, borderTopWidth:2, borderRightWidth:2, borderLeftWidth:2, borderBottomWidth:answered?2:3, borderStyle:"solid", borderTopColor:bc, borderRightColor:bc, borderLeftColor:bc, borderBottomColor:bc, background:bg, cursor:answered?"default":"pointer", transition:"background 0.15s, transform 0.1s", fontFamily:"'Noto Sans JP', sans-serif", fontSize:44, fontWeight:700, color }}
      onMouseEnter={e => { if(!answered)(e.currentTarget as HTMLButtonElement).style.transform="translateY(-2px)"; }}
      onMouseLeave={e => { if(!answered)(e.currentTarget as HTMLButtonElement).style.transform="none"; }}>
      {opt.char}
    </button>
  );
}

export default function KanaMatchPage() {
  const [direction, setDirection] = useState<MatchDirection>("hira-to-kata");
  const { source, correct, options, session, state, chosen, select, next } = useKanaMatch(direction);
  const { speak, muted, toggleMute } = usePronunciation();

  const accuracy = session.total>0 ? Math.round((session.correct/session.total)*100) : 0;
  const questionLabel = direction==="hira-to-kata" ? "Which katakana matches?" : "Which hiragana matches?";

  return (
    <>
      <style>{anims}</style>
      <div style={{ display:"flex", flexDirection:"column", height:"100%", background:"var(--page)", fontFamily:"var(--font-body), DM Sans, sans-serif", overflow:"hidden" }}>

        {/* Top bar */}
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 16px", background:"var(--surface)", borderBottom:"1px solid var(--border)", flexShrink:0, flexWrap:"wrap" }}>
          <Link href="/kana" style={{ display:"flex", alignItems:"center", gap:4, height:30, padding:"0 10px", borderRadius:7, border:"1px solid var(--border)", background:"var(--surface-2)", fontSize:12, fontWeight:700, color:"var(--muted)", textDecoration:"none", flexShrink:0 }}>← Back</Link>
          <div style={{ display:"flex", gap:3, background:"var(--surface-2)", borderRadius:8, padding:2 }}>
            {DIRECTIONS.map(d => (
              <button key={d.value} onClick={() => setDirection(d.value)} style={{ padding:"4px 10px", borderRadius:6, border:"none", fontWeight:700, fontSize:11, cursor:"pointer", background:direction===d.value?"#6366f1":"transparent", color:direction===d.value?"#fff":"var(--muted)" }}>{d.label}</button>
            ))}
          </div>
          <div style={{ flex:1, display:"flex", justifyContent:"flex-end", alignItems:"center", gap:10, fontSize:12, fontWeight:700 }}>
            {session.streak>=3 && <span style={{ color:"#f59e0b" }}>🔥{session.streak}</span>}
            <span style={{ color:"var(--mint-soft)" }}>✓{session.correct}</span>
            <span style={{ color:"var(--danger)" }}>✗{session.incorrect}</span>
            <span style={{ color:"var(--muted)" }}>{accuracy}%</span>
            <button onClick={toggleMute} style={{ fontSize:14, background:"none", border:"none", cursor:"pointer", opacity:muted?0.4:1 }}>🔊</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"16px", gap:12 }}>

          {/* Source card */}
          <div style={{ width:"100%", maxWidth:480 }}>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--muted)", margin:"0 0 8px", textAlign:"center" }}>{questionLabel}</p>
            <div onClick={() => speak(source.char)} title="Click to hear"
              style={{ display:"flex", alignItems:"center", justifyContent:"center", width:"100%", padding:"20px 0", borderRadius:18, background:"var(--surface)", borderTopWidth:2, borderRightWidth:2, borderLeftWidth:2, borderBottomWidth:3, borderStyle:"solid", borderTopColor:"var(--border)", borderRightColor:"var(--border)", borderLeftColor:"var(--border)", borderBottomColor:"#dde3ee", cursor:"pointer" }}>
              <span key={source.char} lang="ja" style={{ fontSize:"clamp(100px, 10vw, 140px)", fontFamily:"'Noto Sans JP', sans-serif", fontWeight:700, lineHeight:1, color:"var(--ink)", userSelect:"none", animation:"km-pop 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}>{source.char}</span>
            </div>
          </div>

          {/* 2×2 options */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, width:"100%", maxWidth:480 }}>
            {options.map(opt => (
              <Option key={opt.char} opt={opt} state={state} chosen={chosen} correct={correct}
                onSelect={ch => { select(ch); speak(ch.char); }} />
            ))}
          </div>

          {state !== "answering" && (
            <div style={{ width:"100%", maxWidth:480, display:"flex", flexDirection:"column", gap:8 }}>
              <p style={{ margin:0, fontSize:13, fontWeight:700, textAlign:"center", color:state==="correct"?"var(--mint-soft)":"var(--danger)" }}>
                {state==="correct" ? `✓ ${source.char} = ${correct.char} (${correct.romaji})` : `✗ It was ${correct.char} (${correct.romaji})`}
              </p>
              <button onClick={next} autoFocus style={{ height:44, borderRadius:12, border:"none", background:state==="correct"?"var(--mint-soft)":"var(--sakura)", color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer" }}>Next →</button>
            </div>
          )}

          <p style={{ fontSize:11, color:"var(--muted)", margin:0 }}>Click the card to hear it</p>
        </div>
      </div>
    </>
  );
}
