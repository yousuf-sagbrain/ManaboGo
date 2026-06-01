"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { speakJa } from "@/hooks/usePronunciation";

interface Props {
  character: string;
  romaji?:   string;
  onClose:   () => void;
}

// Scales CSS custom properties --t and --d on each animated path without
// re-injecting the SVG, so the slider feels instant.
function applySpeed(
  _svg:   Element,
  speed:  number,
  origT:  number,
  delays: Map<Element, number>,
) {
  const tStr = `${(origT / speed).toFixed(3)}s`;
  delays.forEach((origD, path) => {
    const el = path as HTMLElement;
    el.style.setProperty("--t", tStr);
    el.style.setProperty("--d", `${(origD / speed).toFixed(3)}s`);
  });
}

export function StrokeAnimCard({ character, romaji, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const origT        = useRef(0.8);
  const pathDelays   = useRef<Map<Element, number>>(new Map());

  const [svgHtml,    setSvgHtml]    = useState<string | null>(null);
  const [speed,      setSpeed]      = useState(1.0);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [replayKey,  setReplayKey]  = useState(0);

  const speedRef = useRef(speed);
  speedRef.current = speed;

  // Fetch SVG by Unicode codepoint from /assets/kana/stroke-order/
  useEffect(() => {
    setLoading(true);
    setFetchError(false);
    setSvgHtml(null);
    setReplayKey(0);
    const codepoint = character.charCodeAt(0);
    fetch(`/assets/kana/stroke-order/${codepoint}.svg`)
      .then(r => {
        if (!r.ok) throw new Error();
        return r.text();
      })
      .then(html => { setSvgHtml(html); setLoading(false); })
      .catch(() => { setFetchError(true); setLoading(false); });
  }, [character]);

  // Inject SVG, capture original timing, apply current speed
  useEffect(() => {
    const container = containerRef.current;
    if (!svgHtml || !container) return;

    container.innerHTML = svgHtml;
    const svg = container.querySelector("svg");
    if (!svg) return;

    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");

    const styleText = svg.querySelector("style")?.textContent ?? "";
    const tMatch    = styleText.match(/--t\s*:\s*([\d.]+)s/);
    origT.current   = tMatch ? parseFloat(tMatch[1]) : 0.8;

    const delays = new Map<Element, number>();
    svg.querySelectorAll<HTMLElement>("path[clip-path]").forEach(path => {
      const m = (path.getAttribute("style") ?? "").match(/--d\s*:\s*([\d.]+)s/);
      delays.set(path, m ? parseFloat(m[1]) : 0);
    });
    pathDelays.current = delays;

    applySpeed(svg, speedRef.current, origT.current, pathDelays.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svgHtml, replayKey]);

  // Live speed update without re-injecting
  useEffect(() => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;
    applySpeed(svg, speed, origT.current, pathDelays.current);
  }, [speed]);

  const handleReplay = useCallback(() => setReplayKey(k => k + 1), []);
  const handleSpeak  = useCallback(() => speakJa(character, speed), [character, speed]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span lang="ja" style={{ fontSize: 36, fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}>
            {character}
          </span>
          {romaji && (
            <span style={{ fontSize: 18, fontWeight: 800, color: "var(--muted)", fontFamily: "var(--font-display), Nunito, sans-serif", letterSpacing: "0.04em" }}>
              {romaji}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid var(--border)", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--muted)", cursor: "pointer" }}
        >
          ✕
        </button>
      </div>

      {/* SVG animation area */}
      <div style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1 / 1",
        background: "#fff",
        borderRadius: 18,
        borderTopWidth: 2, borderRightWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4,
        borderStyle: "solid",
        borderTopColor: "var(--border)", borderRightColor: "var(--border)", borderLeftColor: "var(--border)", borderBottomColor: "#dde3ee",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {loading && (
          <p style={{ color: "var(--muted)", fontWeight: 700, fontSize: 13 }}>Loading…</p>
        )}
        {fetchError && (
          <p style={{ color: "var(--danger)", fontWeight: 700, fontSize: 13, textAlign: "center", padding: "0 16px" }}>
            Stroke data not available
          </p>
        )}
        <div
          ref={containerRef}
          style={{ width: "100%", height: "100%", padding: 16, visibility: loading || fetchError ? "hidden" : "visible" }}
          aria-label={`Stroke order animation for ${character}`}
          aria-live="polite"
        />
      </div>

      {/* Speed slider */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted)" }}>Speed</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{speed.toFixed(1)}×</span>
        </div>
        <input
          type="range" min={0.7} max={1.2} step={0.1} value={speed}
          onChange={e => setSpeed(parseFloat(e.target.value))}
          style={{ width: "100%", cursor: "pointer", accentColor: "#6366f1" }}
          aria-label={`Animation speed: ${speed.toFixed(1)}x`}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontWeight: 800, color: "var(--muted)", padding: "0 2px", userSelect: "none" }}>
          <span>0.7×</span><span>1.0×</span><span>1.2×</span>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleSpeak}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 44, padding: "0 16px", borderRadius: 12, border: "none", background: "#0ea5e9", color: "#fff", fontFamily: "var(--font-display), Nunito, sans-serif", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
        >
          🔊 Play audio
        </button>
        <button
          onClick={handleReplay}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 44, padding: "0 16px", borderRadius: 12, borderTopWidth: 2, borderRightWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4, borderStyle: "solid", borderTopColor: "var(--border)", borderRightColor: "var(--border)", borderLeftColor: "var(--border)", borderBottomColor: "#dde3ee", background: "var(--surface)", color: "var(--ink)", fontFamily: "var(--font-display), Nunito, sans-serif", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
        >
          ↺ Replay
        </button>
      </div>

    </div>
  );
}
