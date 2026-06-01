"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { hiragana } from "@/data/kana/hiragana";
import { katakana } from "@/data/kana/katakana";
import { speakJa } from "@/hooks/usePronunciation";
import type { KanaChar } from "@/data/kana/types";
import type { ScriptMode } from "@/hooks/useKanaQuiz";

const ALL_KANA: KanaChar[] = [...hiragana, ...katakana];
const RECENT_WINDOW = 8;

function pickRandom(pool: KanaChar[], exclude: Set<string>): KanaChar {
  const f = pool.filter(k => !exclude.has(k.char));
  const s = f.length > 0 ? f : pool;
  return s[Math.floor(Math.random() * s.length)];
}
function buildOptions(correct: KanaChar, pool: KanaChar[]): string[] {
  const d = pool.filter(k=>k.romaji!==correct.romaji).map(k=>k.romaji)
    .filter((r,i,a)=>a.indexOf(r)===i).sort(()=>Math.random()-0.5).slice(0,3);
  return [correct.romaji,...d].sort(()=>Math.random()-0.5);
}

const SCRIPT_OPTIONS: { id: ScriptMode; label: string }[] = [
  { id:"hiragana", label:"Hiragana" },
  { id:"katakana", label:"Katakana" },
  { id:"both",     label:"Both"     },
];

const anims = `
@keyframes ls-pop   { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
@keyframes ls-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(7px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
`;

type QState = "answering"|"correct"|"incorrect";
interface Session { correct:number; incorrect:number; streak:number; streakMax:number; total:number; }
const INIT: Session = { correct:0, incorrect:0, streak:0, streakMax:0, total:0 };

export default function ListeningPracticePage() {
  const [script, setScript] = useState<ScriptMode>("hiragana");
  const pool = script==="hiragana"?hiragana:script==="katakana"?katakana:ALL_KANA;

  const recentRef = useRef<string[]>([]);
  const [current,  setCurrent]  = useState<KanaChar>(() => pickRandom(pool, new Set()));
  const [options,  setOptions]  = useState<string[]>(() => buildOptions(current, pool));
  const [selected, setSelected] = useState<string|null>(null);
  const [state,    setState]    = useState<QState>("answering");
  const [session,  setSession]  = useState<Session>(INIT);
  const [anim,     setAnim]     = useState<"pop"|"shake"|null>(null);
  const [revealed, setRevealed] = useState(false);

  const advance = useCallback(() => {
    const next = pickRandom(pool, new Set(recentRef.current));
    recentRef.current = [...recentRef.current, current.char].slice(-RECENT_WINDOW);
    setCurrent(next); setOptions(buildOptions(next,pool)); setSelected(null); setState("answering"); setRevealed(false); setAnim(null);
  }, [current, pool]);

  useEffect(() => { const t = window.setTimeout(()=>speakJa(current.char),150); return ()=>window.clearTimeout(t); }, [current.char]);
  useEffect(() => { recentRef.current=[]; const n=pickRandom(pool,new Set()); setCurrent(n); setOptions(buildOptions(n,pool)); setSelected(null); setState("answering"); setSession(INIT); setRevealed(false); }, [script]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (opt: string) => {
    if (state!=="answering") return;
    setSelected(opt); setRevealed(true);
    const ok = opt===current.romaji || current.aliases.includes(opt);
    setState(ok?"correct":"incorrect"); setAnim(ok?"pop":"shake"); setTimeout(()=>setAnim(null),500);
    setSession(s => { const streak=ok?s.streak+1:0; return { correct:s.correct+(ok?1:0), incorrect:s.incorrect+(ok?0:1), streak, streakMax:Math.max(s.streakMax,streak), total:s.total+1 }; });
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (state==="answering") { const i=parseInt(e.key,10)-1; if(i>=0&&i<options.length) handleSelect(options[i]); }
      if ((e.key==="Enter"||e.key==="ArrowRight")&&state!=="answering") advance();
    };
    window.addEventListener("keydown",h); return ()=>window.removeEventListener("keydown",h);
  }, [state,options,advance]); // eslint-disable-line react-hooks/exhaustive-deps

  const accuracy = session.total>0 ? Math.round((session.correct/session.total)*100) : 0;

  return (
    <>
      <style>{anims}</style>
      <div style={{ display:"flex", flexDirection:"column", height:"100%", background:"var(--page)", fontFamily:"var(--font-body), DM Sans, sans-serif", overflow:"hidden" }}>

        {/* Top bar */}
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 16px", background:"var(--surface)", borderBottom:"1px solid var(--border)", flexShrink:0, flexWrap:"wrap" }}>
          <Link href="/kana" style={{ display:"flex", alignItems:"center", gap:4, height:30, padding:"0 10px", borderRadius:7, border:"1px solid var(--border)", background:"var(--surface-2)", fontSize:12, fontWeight:700, color:"var(--muted)", textDecoration:"none", flexShrink:0 }}>← Back</Link>
          <div style={{ display:"flex", gap:3, background:"var(--surface-2)", borderRadius:8, padding:2 }}>
            {SCRIPT_OPTIONS.map(s => (
              <button key={s.id} onClick={()=>setScript(s.id)} style={{ padding:"4px 10px", borderRadius:6, border:"none", fontWeight:700, fontSize:11, cursor:"pointer", background:script===s.id?"#0ea5e9":"transparent", color:script===s.id?"#fff":"var(--muted)" }}>{s.label}</button>
            ))}
          </div>
          <div style={{ flex:1, display:"flex", justifyContent:"flex-end", alignItems:"center", gap:10, fontSize:12, fontWeight:700 }}>
            {session.streak>=3 && <span style={{ color:"#f59e0b" }}>🔥{session.streak}</span>}
            <span style={{ color:"var(--mint-soft)" }}>✓{session.correct}</span>
            <span style={{ color:"var(--danger)" }}>✗{session.incorrect}</span>
            <span style={{ color:"var(--muted)" }}>{accuracy}%</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"16px", gap:12 }}>

          {/* Audio card */}
          <div style={{ width:"100%", maxWidth:480, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, padding:"20px 20px 16px", borderRadius:20,
            background:revealed?(state==="correct"?"#f0fdf4":"#fff1f2"):"var(--surface)",
            borderTopWidth:2, borderRightWidth:2, borderLeftWidth:2, borderBottomWidth:3, borderStyle:"solid",
            borderTopColor:revealed?(state==="correct"?"#4ade80":"#f87171"):"var(--border)",
            borderRightColor:revealed?(state==="correct"?"#4ade80":"#f87171"):"var(--border)",
            borderLeftColor:revealed?(state==="correct"?"#4ade80":"#f87171"):"var(--border)",
            borderBottomColor:revealed?(state==="correct"?"#16a34a":"#be123c"):"#dde3ee",
            transition:"background 0.2s, border-color 0.2s",
            animation:anim==="pop"?"ls-pop 0.4s ease":anim==="shake"?"ls-shake 0.5s ease":"none" }}>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--muted)", margin:0 }}>What did you hear?</p>
            {revealed
              ? <span lang="ja" style={{ fontSize:"clamp(100px, 10vw, 140px)", fontFamily:"'Noto Sans JP', sans-serif", fontWeight:700, lineHeight:1, color:state==="correct"?"#15803d":"#be123c", userSelect:"none" }}>{current.char}</span>
              : <span style={{ fontSize:"clamp(100px, 10vw, 140px)", fontWeight:900, lineHeight:1, color:"var(--border)", userSelect:"none" }}>?</span>
            }
            {!revealed && (
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>speakJa(current.char)} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 14px", borderRadius:8, border:"1px solid var(--border)", background:"var(--surface-2)", fontSize:12, fontWeight:700, color:"var(--muted)", cursor:"pointer" }}>🔊 Replay</button>
                <button onClick={()=>speakJa(current.char,0.6)} style={{ padding:"5px 12px", borderRadius:8, border:"1px solid var(--border)", background:"var(--surface-2)", fontSize:12, fontWeight:700, color:"var(--muted)", cursor:"pointer" }}>🐢 Slow</button>
              </div>
            )}
            {revealed && <p style={{ margin:0, fontSize:13, fontWeight:700, color:state==="correct"?"#15803d":"#be123c" }}>{state==="correct"?`✓ Correct! · ${current.romaji}`:`✗ Answer: ${current.romaji}`}</p>}
          </div>

          {/* 2×2 options */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, width:"100%", maxWidth:480 }}>
            {options.map((opt,i) => {
              const isCorrect=opt===current.romaji, isSelected=opt===selected, answered=state!=="answering";
              let bg="var(--surface)",bc="var(--border)",color="var(--ink)",icon:string|null=null;
              if(answered){if(isCorrect){bg="#f0fdf4";bc="#4ade80";color="#15803d";icon="✓"}else if(isSelected){bg="#fff1f2";bc="#f87171";color="#be123c";icon="✗"}else{color="var(--muted)"}}
              return (
                <button key={opt} onClick={()=>handleSelect(opt)} disabled={answered}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"16px 14px", borderRadius:14, borderTopWidth:2, borderRightWidth:2, borderLeftWidth:2, borderBottomWidth:answered?2:3, borderStyle:"solid", borderTopColor:bc, borderRightColor:bc, borderLeftColor:bc, borderBottomColor:bc, background:bg, cursor:answered?"default":"pointer", transition:"background 0.15s" }}>
                  <span style={{ width:26, height:26, borderRadius:6, background:answered?"transparent":"#E8E8E8", border:answered?"none":"1px solid #D0D0D0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:answered?color:"#555", flexShrink:0 }}>{answered&&icon?icon:String(i+1)}</span>
                  <span style={{ fontSize:20, fontWeight:800, color, fontFamily:"var(--font-display), Nunito, sans-serif" }}>{opt}</span>
                </button>
              );
            })}
          </div>

          {state !== "answering" && (
            <button onClick={advance} autoFocus style={{ height:44, padding:"0 36px", borderRadius:12, border:"none", background:state==="correct"?"var(--mint-soft)":"var(--sakura)", color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer", width:"100%", maxWidth:480 }}>
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
