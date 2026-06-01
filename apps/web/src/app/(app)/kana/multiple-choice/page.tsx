"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useKanaQuiz, type ScriptMode } from "@/hooks/useKanaQuiz";
import { usePronunciation } from "@/hooks/usePronunciation";
import { hiragana } from "@/data/kana/hiragana";
import { katakana } from "@/data/kana/katakana";
import type { KanaChar } from "@/data/kana/types";

const SCRIPT_OPTIONS: { id: ScriptMode; label: string }[] = [
  { id: "hiragana", label: "Hiragana" },
  { id: "katakana", label: "Katakana" },
  { id: "both",     label: "Both"     },
];

const anims = `
@keyframes mc-pop   { 0%{transform:scale(1)} 40%{transform:scale(1.08)} 100%{transform:scale(1)} }
@keyframes mc-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(7px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
`;

function buildOptions(correct: KanaChar, pool: KanaChar[]): string[] {
  const distractors = pool.filter(k => k.romaji !== correct.romaji).map(k => k.romaji)
    .filter((r,i,arr) => arr.indexOf(r)===i).sort(() => Math.random()-0.5).slice(0,3);
  return [correct.romaji, ...distractors].sort(() => Math.random()-0.5);
}

export default function MultipleChoicePage() {
  const [script, setScript] = useState<ScriptMode>("hiragana");
  const { current, state, session, submitSelection, next } = useKanaQuiz(script, "multiple-choice");
  const { speak, replay, muted, toggleMute, slow, toggleSlow } = usePronunciation();

  const pool: KanaChar[] = useMemo(() => script==="hiragana"?hiragana:script==="katakana"?katakana:[...hiragana,...katakana], [script]);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string|null>(null);
  const [anim, setAnim] = useState<"pop"|"shake"|null>(null);

  // Rebuild options when character or pool changes (no audio here)
  useEffect(() => { if (current) { setOptions(buildOptions(current,pool)); setSelected(null); } }, [current?.char, pool]); // eslint-disable-line react-hooks/exhaustive-deps
  // Play audio only when the character changes, not when pool changes
  useEffect(() => { if (current && state === "answering") speak(current.char); }, [current?.char]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (state==="correct")   { setAnim("pop");   setTimeout(()=>setAnim(null),400); }
    if (state==="incorrect") { setAnim("shake"); setTimeout(()=>setAnim(null),500); }
  }, [state]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (state==="answering" && options.length>0) { const i=parseInt(e.key,10)-1; if(i>=0&&i<options.length) handleSelect(options[i]); }
      if ((e.key==="Enter"||e.key==="ArrowRight") && state!=="answering") next();
    };
    window.addEventListener("keydown",h); return () => window.removeEventListener("keydown",h);
  }, [state,options,next]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (r: string) => { if(state!=="answering") return; setSelected(r); submitSelection(r); };
  const accuracy = session.total>0 ? Math.round((session.correct/session.total)*100) : 0;
  const cardBg = state==="correct"?"var(--tint-mint)":state==="incorrect"?"var(--tint-red)":"var(--surface)";
  const cardBorderC = state==="correct"?"var(--mint-soft)":state==="incorrect"?"var(--danger)":"var(--border)";

  if (!current) return null;

  return (
    <>
      <style>{anims}</style>
      <div style={{ display:"flex", flexDirection:"column", height:"100%", background:"var(--page)", fontFamily:"var(--font-body), DM Sans, sans-serif", overflow:"hidden" }}>

        {/* Top bar */}
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 16px", background:"var(--surface)", borderBottom:"1px solid var(--border)", flexShrink:0, flexWrap:"wrap" }}>
          <Link href="/kana" style={{ display:"flex", alignItems:"center", gap:4, height:30, padding:"0 10px", borderRadius:7, border:"1px solid var(--border)", background:"var(--surface-2)", fontSize:12, fontWeight:700, color:"var(--muted)", textDecoration:"none", flexShrink:0 }}>← Back</Link>
          <div style={{ display:"flex", gap:3, background:"var(--surface-2)", borderRadius:8, padding:2 }}>
            {SCRIPT_OPTIONS.map(s => (
              <button key={s.id} onClick={() => setScript(s.id)} style={{ padding:"4px 10px", borderRadius:6, border:"none", fontWeight:700, fontSize:11, cursor:"pointer", background:script===s.id?"#6366f1":"transparent", color:script===s.id?"#fff":"var(--muted)" }}>{s.label}</button>
            ))}
          </div>
          <div style={{ flex:1, display:"flex", justifyContent:"flex-end", alignItems:"center", gap:10, fontSize:12, fontWeight:700 }}>
            <span style={{ color:"var(--mint-soft)" }}>✓{session.correct}</span>
            <span style={{ color:"var(--danger)" }}>✗{session.incorrect}</span>
            <span style={{ color:"var(--muted)" }}>{accuracy}%</span>
            <span style={{ color:"#f59e0b" }}>🔥{session.streakMax}</span>
            <button onClick={toggleMute} style={{ fontSize:14, background:"none", border:"none", cursor:"pointer", opacity:muted?0.4:1 }}>🔊</button>
            <button onClick={toggleSlow} style={{ fontSize:14, background:"none", border:"none", cursor:"pointer", opacity:slow?1:0.4 }}>🐢</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"16px", gap:12 }}>

          {/* Character card */}
          <div style={{ background:cardBg, border:`2px solid ${cardBorderC}`, borderRadius:20, width:"100%", maxWidth:480, padding:"16px 24px", display:"flex", flexDirection:"column", alignItems:"center", gap:6, transition:"background 0.2s, border-color 0.2s", boxShadow:"0 2px 16px rgba(26,31,60,0.07)", animation:anim==="pop"?"mc-pop 0.4s ease":anim==="shake"?"mc-shake 0.5s ease":"none" }}>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--muted)", margin:0 }}>Choose the reading</p>
            <span lang="ja" style={{ fontSize:"clamp(100px, 10vw, 140px)", fontFamily:"'Noto Sans JP', sans-serif", fontWeight:700, lineHeight:1, color:"var(--ink)", userSelect:"none" }}>{current.char}</span>
            {state!=="answering" && <p style={{ margin:0, fontSize:13, fontWeight:700, color:state==="correct"?"var(--mint-soft)":"var(--danger)" }}>{state==="correct"?`Correct! · ${current.romaji}`:`Answer: ${current.romaji}`}</p>}
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={() => replay(current.char)} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:8, border:"1px solid var(--border)", background:"var(--surface)", fontSize:12, fontWeight:700, color:"var(--muted)", cursor:"pointer" }}>🔊 Replay</button>
              <button onClick={() => replay(current.char,{slow:true})} style={{ width:30, height:30, borderRadius:8, border:"1px solid var(--border)", background:"var(--surface)", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>🐢</button>
            </div>
          </div>

          {/* 2×2 options */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, width:"100%", maxWidth:480 }}>
            {options.map((opt,i) => {
              const isCorrect=opt===current.romaji, isSelected=opt===selected, answered=state!=="answering";
              let bg="var(--surface)", bc="var(--border)", color="var(--ink)", icon:string|null=null;
              if (answered) { if(isCorrect){bg="var(--tint-mint)";bc="var(--mint-soft)";color="#047857";icon="✓"} else if(isSelected){bg="var(--tint-red)";bc="var(--danger)";color="var(--danger)";icon="✗"} }
              return (
                <button key={opt} onClick={() => handleSelect(opt)} disabled={answered}
                  style={{ background:bg, borderTopWidth:2, borderRightWidth:2, borderLeftWidth:2, borderBottomWidth:answered?2:3, borderStyle:"solid", borderTopColor:bc, borderRightColor:bc, borderLeftColor:bc, borderBottomColor:answered?bc:"var(--border)", borderRadius:14, padding:"16px 14px", display:"flex", alignItems:"center", gap:10, cursor:answered?"default":"pointer", transition:"background 0.15s" }}
                  onMouseEnter={e => { if(!answered) (e.currentTarget as HTMLButtonElement).style.borderColor="#6366f1"; }}
                  onMouseLeave={e => { if(!answered) (e.currentTarget as HTMLButtonElement).style.borderColor="var(--border)"; }}>
                  <span style={{ width:26, height:26, borderRadius:6, background:answered?"transparent":"#E8E8E8", border:answered?"none":"1px solid #D0D0D0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:answered?color:"#555", flexShrink:0 }}>{answered&&icon?icon:String(i+1)}</span>
                  <span style={{ fontSize:20, fontWeight:800, color, fontFamily:"var(--font-display), Nunito, sans-serif" }}>{opt}</span>
                </button>
              );
            })}
          </div>

          {state !== "answering" && (
            <button onClick={next} autoFocus style={{ height:44, padding:"0 36px", borderRadius:12, border:"none", background:state==="correct"?"var(--mint-soft)":"var(--sakura)", color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer", width:"100%", maxWidth:480 }}>
              {state==="correct"?"Next →":"Try next →"}
            </button>
          )}

          <p style={{ fontSize:11, color:"var(--muted)", margin:0 }}>
            <kbd style={{ padding:"1px 5px", borderRadius:3, border:"1px solid var(--border)", fontSize:10, background:"var(--surface-2)" }}>1</kbd>–<kbd style={{ padding:"1px 5px", borderRadius:3, border:"1px solid var(--border)", fontSize:10, background:"var(--surface-2)" }}>4</kbd> to pick · <kbd style={{ padding:"1px 5px", borderRadius:3, border:"1px solid var(--border)", fontSize:10, background:"var(--surface-2)" }}>Enter</kbd> to advance
          </p>
        </div>
      </div>
    </>
  );
}
