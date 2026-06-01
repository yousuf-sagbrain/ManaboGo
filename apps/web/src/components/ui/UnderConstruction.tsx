"use client";

interface UnderConstructionProps {
  title: string;
  description: string;
  phase: string;
  icon: string;
  eta?: string;
}

export function UnderConstruction({ title, description, phase, icon, eta }: UnderConstructionProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 480, padding: "40px 24px", fontFamily: "var(--font-body), DM Sans, sans-serif", textAlign: "center" }}>

      {/* Icon */}
      <div style={{ fontSize: 56, marginBottom: 20, lineHeight: 1 }}>{icon}</div>

      {/* Phase badge */}
      <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", background: "var(--tint-red)", color: "var(--sakura)", borderRadius: 999, padding: "3px 12px", marginBottom: 14, border: "1px solid #BFDBFE" }}>
        {phase}
      </span>

      <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", margin: "0 0 10px", fontFamily: "var(--font-display), Nunito, sans-serif" }}>
        {title}
      </h1>

      <p style={{ fontSize: 14, color: "var(--muted)", maxWidth: 420, lineHeight: 1.6, margin: "0 0 28px" }}>
        {description}
      </p>

      {/* Under construction card */}
      <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 18, padding: "22px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, maxWidth: 360, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>🚧</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", fontFamily: "var(--font-display), Nunito, sans-serif" }}>Under Construction</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
          This feature is being built. Check back soon!
        </p>
        {eta && (
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", background: "var(--surface-2)", borderRadius: 8, padding: "4px 12px", marginTop: 4 }}>
            Expected: {eta}
          </span>
        )}
      </div>

    </div>
  );
}
