"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { hiragana } from "@/data/kana/hiragana";
import { katakana } from "@/data/kana/katakana";
import { usePronunciation } from "@/hooks/usePronunciation";
import type { KanaChar } from "@/data/kana/types";

const ALL_KANA: KanaChar[] = [...hiragana, ...katakana];
const RECENT_WINDOW = 8;
const SECONDS_PER_CHAR = 5;
const MAX_HEARTS = 5;

function pickRandom(exclude: Set<string>): KanaChar {
  const pool = ALL_KANA.filter(k => !exclude.has(k.char));
  const s = pool.length > 0 ? pool : ALL_KANA;
  return s[Math.floor(Math.random() * s.length)];
}
function checkCorrect(input: string, char: KanaChar) {
  const v = input.trim().toLowerCase();
  return v === char.romaji || char.aliases.includes(v);
}

type GameState = "briefing"|"playing"|"gameover";

const anims = `
@keyframes ta-shake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-8px)} 30%{transform:translateX(8px)} 45%{transform:translateX(-5px)} 60%{transform:translateX(5px)} }
@keyframes ta-pop   { 0%{transform:scale(1)} 40%{transform:scale(1.1)} 100%{transform:scale(1)} }
`;

export default function TimeAttackPage() {
  const [gameState, setGameState] = useState<GameState>("briefing");
  const [current,   setCurrent]   = useState<KanaChar>(() => pickRandom(new Set()));
  const [input,     setInput]     = useState("");
  const [hearts,    setHearts]    = useState(MAX_HEARTS);
  const [timeLeft,  setTimeLeft]  = useState(SECONDS_PER_CHAR);
  const [feedback,  setFeedback]  = useState<{ text:string; correct:boolean }|null>(null);
  const [session,   setSession]   = useState({ correct:0, incorrect:0, total:0 });
  const [anim,      setAnim]      = useState<"shake"|"pop"|null>(null);

  const recentRef = useRef<string[]>([]);
  const inputRef  = useRef<HTMLInputElement>(null);
  const { speak, slow, toggleSlow } = usePronunciation();
  const accuracy = session.total>0 ? Math.round((session.correct/session.total)*100) : 0;

  const nextChar = useCallback(() => {
    const next = pickRandom(new Set(recentRef.current));
    recentRef.current = [...recentRef.current, current.char].slice(-RECENT_WINDOW);
    setCurrent(next); setInput(""); setTimeLeft(SECONDS_PER_CHAR); setFeedback(null); setAnim(null);
  }, [current, speak]);

  const handleWrong = useCallback((reason: string) => {
    setFeedback({ text:reason, correct:false }); setAnim("shake"); setTimeout(()=>setAnim(null),500);
    setHearts(h=>h-1); setSession(s=>({...s, incorrect:s.incorrect+1, total:s.total+1}));
  }, []);

  const handleCorrect = useCallback(() => {
    setFeedback({ text:`✓ ${current.romaji}`, correct:true }); setAnim("pop"); setTimeout(()=>setAnim(null),400);
    setSession(s=>({...s, correct:s.correct+1, total:s.total+1}));
  }, [current]);

  useEffect(() => {
    if (gameState!=="playing"||feedback!==null) return;
    if (timeLeft<=0) { handleWrong(`Time's up! It was "${current.romaji}"`); return; }
    const id = window.setInterval(()=>setTimeLeft(t=>t-1),1000);
    return ()=>window.clearInterval(id);
  }, [gameState,timeLeft,feedback,current,handleWrong]);

  useEffect(() => { if(hearts<=0&&gameState==="playing") setGameState("gameover"); }, [hearts,gameState]);
  useEffect(() => { if(gameState==="playing") { speak(current.char); setTimeout(()=>inputRef.current?.focus(),50); } }, [current.char,gameState]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if(!feedback||hearts<=0) return; const t=window.setTimeout(()=>nextChar(),1200); return()=>window.clearTimeout(t); }, [feedback,hearts,nextChar]);

  const handleSubmit = () => {
    if(feedback!==null||gameState!=="playing"||!input.trim()) return;
    if (checkCorrect(input,current)) handleCorrect(); else handleWrong(`"${input.trim()}" is wrong — it's "${current.romaji}"`);
  };

  const startGame = () => {
    recentRef.current=[];
    const first=pickRandom(new Set());
    setCurrent(first); setInput(""); setHearts(MAX_HEARTS); setTimeLeft(SECONDS_PER_CHAR); setFeedback(null); setSession({correct:0,incorrect:0,total:0}); setAnim(null); setGameState("playing");
  };

  // ── Briefing ──────────────────────────────────────────────────────────────
  if (gameState === "briefing") {
    return (
      <div style={{ display:"flex", flexDirection:"column", height:"100%", background:"var(--page)", fontFamily:"var(--font-body), DM Sans, sans-serif", overflow:"hidden" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 16px", background:"var(--surface)", borderBottom:"1px solid var(--border)", flexShrink:0 }}>
          <Link href="/kana" style={{ display:"flex", alignItems:"center", gap:4, height:30, padding:"0 10px", borderRadius:7, border:"1px solid var(--border)", background:"var(--surface-2)", fontSize:12, fontWeight:700, color:"var(--muted)", textDecoration:"none", flexShrink:0 }}>← Back</Link>
          <span style={{ fontSize:12, fontWeight:700, background:"#fff7ed", color:"#c2410c", borderRadius:999, padding:"3px 10px", border:"1px solid #fed7aa" }}>⚡ Time Attack</span>
        </div>
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px", overflow:"hidden" }}>
          <div style={{ maxWidth:440, width:"100%", display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:40, marginBottom:8 }}>⚡</div>
              <h1 style={{ fontSize:22, fontWeight:800, color:"var(--ink)", margin:"0 0 4px", fontFamily:"var(--font-display), Nunito, sans-serif" }}>Time Attack</h1>
              <p style={{ fontSize:13, color:"var(--muted)", margin:0 }}>5 seconds per character. Lose all 5 hearts and the session ends.</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {[{e:"⏱",v:"5 sec",l:"Per char"},{e:"❤️",v:"5",l:"Lives"},{e:"⚡",v:"Endless",l:"Until 0 hearts"}].map(s=>(
                <div key={s.l} style={{ background:"var(--surface)", borderRadius:14, padding:"12px 8px", textAlign:"center", border:"1.5px solid var(--border)" }}>
                  <div style={{ fontSize:20, marginBottom:4 }}>{s.e}</div>
                  <div style={{ fontSize:18, fontWeight:800, color:"var(--ink)", fontFamily:"var(--font-display), Nunito, sans-serif" }}>{s.v}</div>
                  <div style={{ fontSize:10, color:"var(--muted)", marginTop:2 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ background:"#1A1F3C", borderRadius:14, padding:"14px 18px", color:"#fff" }}>
              <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", opacity:0.6, margin:"0 0 8px" }}>How it works</p>
              <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:4, fontSize:12, fontWeight:600, opacity:0.9 }}>
                <li>· A countdown shows your remaining time</li>
                <li>· Type the romaji and press Enter before it runs out</li>
                <li>· Wrong answer or timeout costs one ❤️</li>
              </ul>
            </div>
            <button onClick={startGame} style={{ height:46, borderRadius:12, border:"none", background:"var(--sakura)", color:"#fff", fontFamily:"var(--font-display), Nunito, sans-serif", fontWeight:800, fontSize:15, cursor:"pointer" }}>
              I&apos;m ready — Start! ⚡
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Game over ─────────────────────────────────────────────────────────────
  if (gameState === "gameover") {
    return (
      <div style={{ display:"flex", flexDirection:"column", height:"100%", background:"var(--page)", fontFamily:"var(--font-body), DM Sans, sans-serif", overflow:"hidden" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 16px", background:"var(--surface)", borderBottom:"1px solid var(--border)", flexShrink:0 }}>
          <Link href="/kana" style={{ display:"flex", alignItems:"center", gap:4, height:30, padding:"0 10px", borderRadius:7, border:"1px solid var(--border)", background:"var(--surface-2)", fontSize:12, fontWeight:700, color:"var(--muted)", textDecoration:"none", flexShrink:0 }}>← Back</Link>
        </div>
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, padding:"20px" }}>
          <div style={{ fontSize:48 }}>💔</div>
          <h2 style={{ fontSize:22, fontWeight:800, color:"var(--ink)", margin:0, fontFamily:"var(--font-display), Nunito, sans-serif" }}>Session Over</h2>
          <div style={{ display:"flex", gap:20, fontSize:14, fontWeight:700 }}>
            <span style={{ color:"var(--mint-soft)" }}>✓ {session.correct}</span>
            <span style={{ color:"var(--danger)" }}>✗ {session.incorrect}</span>
            <span style={{ color:"var(--muted)" }}>{accuracy}%</span>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Link href="/kana" style={{ padding:"11px 24px", borderRadius:12, border:"1.5px solid var(--border)", background:"var(--surface)", color:"var(--ink)", textDecoration:"none", fontFamily:"var(--font-display), Nunito, sans-serif", fontWeight:700, fontSize:14 }}>Back</Link>
            <button onClick={startGame} style={{ padding:"11px 24px", borderRadius:12, border:"none", background:"var(--sakura)", color:"#fff", fontFamily:"var(--font-display), Nunito, sans-serif", fontWeight:800, fontSize:14, cursor:"pointer" }}>Play again ⚡</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Playing ───────────────────────────────────────────────────────────────
  const timerPct  = (timeLeft / SECONDS_PER_CHAR) * 100;
  const timerColor = timeLeft<=2?"#ef4444":timeLeft<=3?"#f59e0b":"var(--mint-soft)";
  const cardBg     = feedback?(feedback.correct?"#f0fdf4":"#fff1f2"):"var(--surface)";
  const cardBorderC = feedback?(feedback.correct?"#4ade80":"#f87171"):"var(--border)";

  return (
    <>
      <style>{anims}</style>
      <div style={{ display:"flex", flexDirection:"column", height:"100%", background:"var(--page)", fontFamily:"var(--font-body), DM Sans, sans-serif", overflow:"hidden" }}>

        {/* Top bar */}
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 16px", background:"var(--surface)", borderBottom:"1px solid var(--border)", flexShrink:0 }}>
          <Link href="/kana" style={{ display:"flex", alignItems:"center", gap:4, height:30, padding:"0 10px", borderRadius:7, border:"1px solid var(--border)", background:"var(--surface-2)", fontSize:12, fontWeight:700, color:"var(--muted)", textDecoration:"none", flexShrink:0 }}>← Back</Link>
          <span style={{ fontSize:12, fontWeight:700, background:"#fff7ed", color:"#c2410c", borderRadius:999, padding:"3px 10px", border:"1px solid #fed7aa" }}>⚡ Time Attack</span>
          <div style={{ flex:1, display:"flex", justifyContent:"flex-end", alignItems:"center", gap:10 }}>
            <div style={{ display:"flex", gap:3 }}>{Array.from({length:MAX_HEARTS}).map((_,i)=><span key={i} style={{ fontSize:14, opacity:i<hearts?1:0.2 }}>❤️</span>)}</div>
            <span style={{ fontSize:12, fontWeight:700, color:"var(--muted)" }}>{accuracy}%</span>
            <button onClick={toggleSlow} style={{ fontSize:13, background:"none", border:"none", cursor:"pointer", opacity:slow?1:0.4 }}>🐢</button>
          </div>
        </div>

        {/* Timer bar */}
        <div style={{ height:4, background:"var(--border)", flexShrink:0 }}>
          <div style={{ height:"100%", width:`${timerPct}%`, background:timerColor, transition:"width 1s linear, background 0.3s" }} />
        </div>

        {/* Body */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"16px", gap:12 }}>

          <div style={{ fontSize:24, fontWeight:900, color:timerColor, fontVariantNumeric:"tabular-nums" }}>{timeLeft}s</div>

          {/* Character card */}
          <div style={{ width:"100%", maxWidth:480, padding:"20px 0", borderRadius:20, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8,
            background:cardBg, borderTopWidth:2, borderRightWidth:2, borderLeftWidth:2, borderBottomWidth:3, borderStyle:"solid",
            borderTopColor:cardBorderC, borderRightColor:cardBorderC, borderLeftColor:cardBorderC, borderBottomColor:feedback?cardBorderC:"#dde3ee",
            transition:"background 0.2s, border-color 0.2s",
            animation:anim==="shake"?"ta-shake 0.5s ease":anim==="pop"?"ta-pop 0.4s ease":"none" }}>
            <span lang="ja" style={{ fontSize:"clamp(100px, 10vw, 140px)", fontFamily:"'Noto Sans JP', sans-serif", fontWeight:700, lineHeight:1, color:feedback?(feedback.correct?"#15803d":"#be123c"):"var(--ink)", userSelect:"none" }}>{current.char}</span>
            {feedback && <p style={{ margin:0, fontSize:13, fontWeight:700, color:feedback.correct?"#15803d":"#be123c" }}>{feedback.text}</p>}
          </div>

          {/* Input */}
          {!feedback && (
            <div style={{ width:"100%", maxWidth:480, display:"flex", gap:8 }}>
              <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")handleSubmit();}}
                placeholder="Type romaji fast…" autoComplete="off" autoCapitalize="none" spellCheck={false}
                style={{ flex:1, height:46, borderRadius:12, borderTopWidth:2, borderRightWidth:2, borderLeftWidth:2, borderBottomWidth:3, borderStyle:"solid", borderTopColor:"var(--border)", borderRightColor:"var(--border)", borderLeftColor:"var(--border)", borderBottomColor:"var(--border)", background:"var(--surface)", padding:"0 14px", fontSize:18, fontWeight:700, color:"var(--ink)", outline:"none" }}
                onFocus={e=>(e.target.style.borderColor="var(--sakura)")}
                onBlur={e=>{e.target.style.borderTopColor="var(--border)";e.target.style.borderRightColor="var(--border)";e.target.style.borderLeftColor="var(--border)";}} />
              <button onClick={handleSubmit} style={{ height:46, padding:"0 18px", borderRadius:12, border:"none", background:"var(--sakura)", color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer" }}>Enter</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
