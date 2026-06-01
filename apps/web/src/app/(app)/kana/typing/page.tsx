"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useKanaQuiz, type ScriptMode } from "@/hooks/useKanaQuiz";
import { usePronunciation } from "@/hooks/usePronunciation";

const SCRIPT_OPTIONS: { id: ScriptMode; label: string }[] = [
  { id: "hiragana", label: "Hiragana" },
  { id: "katakana", label: "Katakana" },
  { id: "both",     label: "Both"     },
];

const anims = `
@keyframes kana-shake { 0%,100%{transform:translateX(0)} 18%{transform:translateX(-7px)} 36%{transform:translateX(7px)} 54%{transform:translateX(-4px)} 72%{transform:translateX(4px)} }
@keyframes kana-pop   { 0%{transform:scale(1)} 40%{transform:scale(1.1)} 100%{transform:scale(1)} }
`;

export default function TypingPracticePage() {
  const [script, setScript] = useState<ScriptMode>("hiragana");
  const { current, input, state, session, setInput, submit, next } = useKanaQuiz(script, "typing");
  const { speak, replay, muted, toggleMute, slow, toggleSlow } = usePronunciation();

  const inputRef = useRef<HTMLInputElement>(null);
  const [anim, setAnim] = useState<"shake"|"pop"|null>(null);

  useEffect(() => { if (current && state === "answering") speak(current.char); }, [current?.char]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (state === "incorrect") { setAnim("shake"); setTimeout(() => setAnim(null), 500); }
    if (state === "correct")   { setAnim("pop");   setTimeout(() => setAnim(null), 400); }
  }, [state]);
  useEffect(() => { if (state === "answering") inputRef.current?.focus(); }, [state, current]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Enter") { if (state === "answering") submit(); else next(); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [state, submit, next]);

  const accuracy = session.total > 0 ? Math.round((session.correct / session.total) * 100) : 0;
  const cardBg = state === "correct" ? "var(--tint-mint)" : state === "incorrect" ? "var(--tint-red)" : "var(--surface)";
  const cardBorderC = state === "correct" ? "var(--mint-soft)" : state === "incorrect" ? "var(--danger)" : "var(--border)";

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
              <button key={s.id} onClick={() => setScript(s.id)} style={{ padding:"4px 10px", borderRadius:6, border:"none", fontWeight:700, fontSize:11, cursor:"pointer", background:script===s.id?"var(--sakura)":"transparent", color:script===s.id?"#fff":"var(--muted)" }}>{s.label}</button>
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
          <div style={{ background:cardBg, borderRadius:20, width:"100%", maxWidth:480, padding:"20px 24px 16px", display:"flex", flexDirection:"column", alignItems:"center", gap:8, border:`2px solid ${cardBorderC}`, transition:"background 0.2s, border-color 0.2s", boxShadow:"0 2px 16px rgba(26,31,60,0.07)", animation:anim==="shake"?"kana-shake 0.5s ease":anim==="pop"?"kana-pop 0.4s ease":"none" }}>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--muted)", margin:0 }}>What&apos;s the reading?</p>
            <span lang="ja" style={{ fontSize:"clamp(100px, 10vw, 140px)", fontFamily:"'Noto Sans JP', sans-serif", fontWeight:700, lineHeight:1, color:"var(--ink)", userSelect:"none" }}>{current.char}</span>
            {state === "incorrect" && <p style={{ margin:0, fontSize:13, fontWeight:700, color:"var(--danger)" }}>Answer: <span style={{ color:"var(--ink)" }}>{current.romaji}</span></p>}
            {state === "correct"   && <p style={{ margin:0, fontSize:13, fontWeight:700, color:"var(--mint-soft)" }}>Correct! · {current.romaji}</p>}
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={() => replay(current.char)} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:8, border:"1px solid var(--border)", background:"var(--surface)", fontSize:12, fontWeight:700, color:"var(--muted)", cursor:"pointer" }}>🔊 Replay</button>
              <button onClick={() => replay(current.char, { slow:true })} style={{ width:30, height:30, borderRadius:8, border:"1px solid var(--border)", background:"var(--surface)", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }} title="Slow">🐢</button>
            </div>
          </div>

          {/* Input / Next button */}
          {state === "answering" ? (
            <div style={{ width:"100%", maxWidth:480, display:"flex", gap:8 }}>
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key==="Enter") submit(); }}
                placeholder="Type romaji…" autoComplete="off" autoCapitalize="none" spellCheck={false}
                style={{ flex:1, height:46, borderRadius:12, border:"2px solid var(--border)", background:"var(--surface)", padding:"0 14px", fontSize:18, fontWeight:700, color:"var(--ink)", outline:"none", letterSpacing:"0.04em" }}
                onFocus={e => (e.target.style.borderColor="var(--sakura)")}
                onBlur={e  => (e.target.style.borderColor="var(--border)")} />
              <button onClick={() => submit()} style={{ height:46, padding:"0 18px", borderRadius:12, border:"none", background:"var(--sakura)", color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer" }}>Check</button>
            </div>
          ) : (
            <button onClick={next} autoFocus style={{ height:46, padding:"0 36px", borderRadius:12, border:"none", background:state==="correct"?"var(--mint-soft)":"var(--sakura)", color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer", width:"100%", maxWidth:480 }}>
              {state==="correct" ? "Next →" : "Try next →"}
            </button>
          )}

          <p style={{ fontSize:11, color:"var(--muted)", margin:0 }}>
            <kbd style={{ padding:"1px 5px", borderRadius:3, border:"1px solid var(--border)", fontSize:10, background:"var(--surface-2)" }}>Enter</kbd> to submit or advance
          </p>
        </div>
      </div>
    </>
  );
}
