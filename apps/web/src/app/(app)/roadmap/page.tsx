"use client";

import Link from "next/link";

// ── Curriculum data ───────────────────────────────────────────
type NodeStatus = "completed" | "current" | "locked";

interface LessonNode {
  id: string;
  title: string;
  subtitle: string;
  status: NodeStatus;
  kanji?: string;
  xp: number;
}

interface Stage {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  colorTint: string;
  nodes: LessonNode[];
}

const STAGES: Stage[] = [
  {
    id: 1,
    title: "Stage 1: Kana Mastery",
    subtitle: "Hiragana 46 + Katakana 46 + dakuten & combinations",
    icon: "あ",
    color: "var(--sage)",
    colorTint: "var(--sage-tint)",
    nodes: [
      { id: "h-row-a",  title: "Hiragana · Row あ",       subtitle: "あいうえお",     status: "completed", kanji: "あ", xp: 100 },
      { id: "h-row-ka", title: "Hiragana · Row か",       subtitle: "かきくけこ",     status: "completed", kanji: "か", xp: 100 },
      { id: "h-row-sa", title: "Hiragana · Row さ",       subtitle: "さしすせそ",     status: "completed", kanji: "さ", xp: 100 },
      { id: "h-row-ta", title: "Hiragana · Row た",       subtitle: "たちつてと",     status: "completed", kanji: "た", xp: 100 },
      { id: "h-row-na", title: "Hiragana · Row な",       subtitle: "なにぬねの",     status: "completed", kanji: "な", xp: 100 },
      { id: "h-all",    title: "Hiragana Review",          subtitle: "All 46 characters", status: "completed", kanji: "ひ", xp: 200 },
      { id: "k-row-a",  title: "Katakana · Row ア",       subtitle: "アイウエオ",     status: "completed", kanji: "ア", xp: 100 },
      { id: "k-all",    title: "Katakana Review",          subtitle: "All 46 characters", status: "completed", kanji: "カ", xp: 200 },
      { id: "dakuten",  title: "Dakuten & Combinations",   subtitle: "が、ざ、ば、きゃ", status: "completed", kanji: "゛", xp: 150 },
    ],
  },
  {
    id: 2,
    title: "Stage 2: Kanji Acquisition",
    subtitle: "103 N5 kanji with stroke-order animation",
    icon: "漢",
    color: "var(--accent)",
    colorTint: "var(--accent-tint)",
    nodes: [
      { id: "k-numbers", title: "Numbers",          subtitle: "一二三四五六七八九十",  status: "completed", kanji: "一", xp: 120 },
      { id: "k-time",    title: "Time & Dates",      subtitle: "日月火水木金土年",       status: "completed", kanji: "月", xp: 120 },
      { id: "k-nature",  title: "Nature",            subtitle: "山川田木花",             status: "completed", kanji: "山", xp: 120 },
      { id: "k-people",  title: "People",            subtitle: "人子女男",               status: "current",   kanji: "人", xp: 120 },
      { id: "k-actions", title: "Actions",           subtitle: "見行食飲来言",           status: "locked",    kanji: "行", xp: 150 },
      { id: "k-dir",     title: "Directions",        subtitle: "上下中大小",             status: "locked",    kanji: "上", xp: 120 },
      { id: "k-adj",     title: "Adjectives",        subtitle: "新古高安白",             status: "locked",    kanji: "新", xp: 150 },
      { id: "k-all",     title: "Kanji Review Quiz", subtitle: "All 103 characters",     status: "locked",    kanji: "漢", xp: 300 },
    ],
  },
  {
    id: 3,
    title: "Stage 3: Vocabulary Expansion",
    subtitle: "800 N5 words in themed groups",
    icon: "語",
    color: "var(--pro)",
    colorTint: "var(--pro-tint)",
    nodes: [
      { id: "v-greet",  title: "Greetings",           subtitle: "こんにちは、ありがとう…", status: "locked", kanji: "挨", xp: 100 },
      { id: "v-food",   title: "Food & Drink",         subtitle: "たべもの、のみもの…",    status: "locked", kanji: "食", xp: 120 },
      { id: "v-travel", title: "Travel & Transport",   subtitle: "でんしゃ、ひこうき…",    status: "locked", kanji: "旅", xp: 120 },
      { id: "v-home",   title: "Home & Family",        subtitle: "いえ、かぞく…",          status: "locked", kanji: "家", xp: 120 },
      { id: "v-time",   title: "Time Expressions",     subtitle: "きのう、あした、いつも…", status: "locked", kanji: "時", xp: 120 },
      { id: "v-body",   title: "Body & Health",        subtitle: "からだ、きもち…",        status: "locked", kanji: "体", xp: 120 },
      { id: "v-shop",   title: "Shopping & Money",     subtitle: "かいもの、おかね…",      status: "locked", kanji: "金", xp: 120 },
      { id: "v-all",    title: "Vocabulary Review",    subtitle: "800 N5 words",           status: "locked", kanji: "語", xp: 300 },
    ],
  },
  {
    id: 4,
    title: "Stage 4: Grammar & Sentences",
    subtitle: "50 N5 grammar patterns, particle drills, verb conjugation",
    icon: "文",
    color: "var(--coral)",
    colorTint: "var(--coral-tint)",
    nodes: [
      { id: "g-particles", title: "Core Particles",       subtitle: "は・が・を・に・で…",   status: "locked", kanji: "は", xp: 150 },
      { id: "g-copula",    title: "だ・です・ます",       subtitle: "Polite speech forms",    status: "locked", kanji: "す", xp: 150 },
      { id: "g-te-form",   title: "て-form Verbs",        subtitle: "食べて、飲んで…",        status: "locked", kanji: "て", xp: 200 },
      { id: "g-adj",       title: "Adjective Patterns",   subtitle: "い・な adjectives",      status: "locked", kanji: "形", xp: 150 },
      { id: "g-negative",  title: "Negation",             subtitle: "～ない、～ません",        status: "locked", kanji: "否", xp: 150 },
      { id: "g-question",  title: "Questions",            subtitle: "か・ね・よ endings",      status: "locked", kanji: "か", xp: 150 },
      { id: "g-all",       title: "Grammar Review",       subtitle: "50 N5 patterns",          status: "locked", kanji: "文", xp: 300 },
      { id: "mock-unlock", title: "✦ Mock Test Unlocked", subtitle: "Complete all 4 stages",   status: "locked", kanji: "試", xp: 500 },
    ],
  },
];

// ── Node component ────────────────────────────────────────────
function RoadmapNode({ node, stage, isLast }: { node: LessonNode; stage: Stage; isLast: boolean }) {
  const isCompleted = node.status === "completed";
  const isCurrent   = node.status === "current";
  const isLocked    = node.status === "locked";

  const nodeSize = isCurrent ? 68 : 56;
  const bg    = isCompleted ? stage.colorTint : isCurrent ? stage.colorTint : "var(--base-2)";
  const border= isCompleted ? stage.color     : isCurrent ? stage.color     : "var(--border)";
  const color = isCompleted ? stage.color     : isCurrent ? stage.color     : "var(--ink-subtle)";

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 20, position: "relative" }}>
      {/* Connector line */}
      {!isLast && (
        <div style={{
          position: "absolute",
          left: nodeSize / 2 - 1,
          top: nodeSize,
          width: 2,
          height: "calc(100% + 16px)",
          background: isCompleted ? stage.color : "var(--border-soft)",
          opacity: isCompleted ? 0.4 : 1,
        }} />
      )}

      {/* Node circle */}
      <div style={{
        width: nodeSize,
        height: nodeSize,
        borderRadius: "50%",
        background: bg,
        border: `2.5px solid ${border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        position: "relative",
        zIndex: 1,
        animation: isCurrent ? "pulseRing 1.8s var(--ease-spring) infinite" : "none",
        cursor: isLocked ? "default" : "pointer",
        transition: "transform 0.15s ease",
      }}>
        {isCompleted ? (
          <span style={{ fontSize: 20, color: stage.color }}>✓</span>
        ) : isLocked ? (
          <span style={{ fontSize: 18, color: "var(--ink-subtle)" }}>🔒</span>
        ) : (
          <span style={{ fontFamily: "var(--font-jp)", fontSize: 26, color }}>
            {node.kanji}
          </span>
        )}
      </div>

      {/* Card */}
      <div style={{
        flex: 1,
        background: "var(--surface)",
        border: `1px solid ${isCurrent ? border : "var(--border-soft)"}`,
        borderRadius: 14,
        padding: "14px 18px",
        marginBottom: 16,
        boxShadow: isCurrent ? `var(--shadow-card-md)` : "var(--shadow-card)",
        opacity: isLocked ? 0.65 : 1,
        cursor: isLocked ? "default" : "pointer",
        transition: "box-shadow 0.15s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: isLocked ? "var(--ink-muted)" : "var(--ink)", marginBottom: 4 }}>
              {node.title}
            </div>
            <div style={{ fontFamily: "var(--font-jp)", fontSize: 13, color: "var(--ink-muted)" }}>
              {node.subtitle}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--pro)", background: "var(--pro-tint)", borderRadius: 999, padding: "2px 8px" }}>
              +{node.xp} XP
            </span>
            {isCurrent && (
              <Link href="/learn" className="btn btn-primary" style={{ borderRadius: 10, height: 32, fontSize: 12, padding: "0 14px" }}>
                Start →
              </Link>
            )}
            {isCompleted && (
              <span style={{ fontSize: 11, color: "var(--sage)", fontWeight: 600 }}>Done ✓</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function RoadmapPage() {
  const totalNodes     = STAGES.flatMap((s) => s.nodes).length;
  const completedNodes = STAGES.flatMap((s) => s.nodes).filter((n) => n.status === "completed").length;
  const overallPct     = Math.round((completedNodes / totalNodes) * 100);

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "var(--base)" }}>
      <div className="page-pad" style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Header */}
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "var(--ink)", margin: "0 0 6px 0" }}>
            Learning Roadmap
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-muted)", margin: "0 0 20px 0" }}>
            Complete all 4 stages to unlock the N5 Certification Exam
          </p>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 14, padding: "16px 20px", boxShadow: "var(--shadow-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-soft)" }}>Overall Progress</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>{overallPct}% · {completedNodes}/{totalNodes} lessons</span>
            </div>
            <div className="progress-track" style={{ height: 10 }}>
              <div className="progress-fill" style={{ width: `${overallPct}%` }} />
            </div>
          </div>
        </div>

        {/* Stages */}
        {STAGES.map((stage) => {
          const stageDone = stage.nodes.filter((n) => n.status === "completed").length;
          const stageTotal = stage.nodes.length;
          const stagePct = Math.round((stageDone / stageTotal) * 100);
          const isAllDone = stageDone === stageTotal;

          return (
            <div key={stage.id}>
              {/* Stage header */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: stage.colorTint, border: `2px solid ${stage.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-jp)", fontSize: 22, color: stage.color, flexShrink: 0 }}>
                  {stage.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--ink)", marginBottom: 2 }}>
                    {stage.title}
                    {isAllDone && <span style={{ marginLeft: 8, fontSize: 12, color: "var(--sage)", fontWeight: 600 }}>✓ Complete</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>{stage.subtitle}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: stage.color }}>{stagePct}%</div>
                  <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>{stageDone}/{stageTotal}</div>
                </div>
              </div>

              {/* Stage progress */}
              <div style={{ marginBottom: 24 }}>
                <div className="progress-track" style={{ height: 6 }}>
                  <div className="progress-fill" style={{ width: `${stagePct}%`, background: stage.color }} />
                </div>
              </div>

              {/* Gating notice */}
              {stage.nodes[0].status === "locked" && (
                <div style={{ background: "var(--base-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "var(--ink-muted)", display: "flex", gap: 10, alignItems: "center" }}>
                  <span>🔒</span>
                  <span>Complete the previous stage with 80%+ mastery to unlock this stage.</span>
                </div>
              )}

              {/* Lesson nodes */}
              <div style={{ paddingLeft: 0 }}>
                {stage.nodes.map((node, i) => (
                  <RoadmapNode
                    key={node.id}
                    node={node}
                    stage={stage}
                    isLast={i === stage.nodes.length - 1}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Certification unlock card */}
        <div style={{ background: "linear-gradient(135deg, var(--pro-tint) 0%, #FEF8EC 100%)", border: "1.5px solid var(--pro-ring)", borderRadius: 20, padding: "24px 28px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-jp)", fontSize: 48, marginBottom: 12 }}>🏆</div>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--ink)", margin: "0 0 8px 0" }}>
            N5 Certification Exam
          </h3>
          <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: "0 0 18px 0" }}>
            Complete all 4 stages and achieve a 70%+ readiness score to unlock the official ManaboGo N5 Certificate.
          </p>
          <span className="pill pill-pro" style={{ fontSize: 11, height: 26, padding: "0 14px" }}>Pro members only</span>
        </div>

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
