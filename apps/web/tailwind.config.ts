import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── ManaboGo warm design tokens ──────────────────────────
        // Primary accent — muted indigo
        accent: {
          DEFAULT: "#5B6ABF",
          hover:   "#4A58A8",
          press:   "#3D4A9A",
          ring:    "#C7CBE8",
          tint:    "#ECEEF8",
          "tint-2":"#D8DCF2",
        },
        // Pro tier — warm gold
        pro: {
          DEFAULT: "#C9A96E",
          hover:   "#B8954F",
          tint:    "#FAF3E3",
          ring:    "#EDD9A8",
        },
        // Success — sage green
        sage: {
          DEFAULT: "#7BAE7F",
          hover:   "#6A9D6E",
          tint:    "#EEF5EE",
          ring:    "#C2D9C3",
        },
        // Error — warm coral
        coral: {
          DEFAULT: "#D4726A",
          hover:   "#C05E56",
          tint:    "#FAEDEC",
          ring:    "#EDBBBA",
        },
        // Warm amber (streak / warning)
        amber: {
          DEFAULT: "#D4935A",
          tint:    "#FDF3EA",
          ring:    "#EDD4B4",
        },
        // Base surfaces — warm off-white
        base: {
          DEFAULT: "#FAF8F5",
          2:       "#F0EEEB",
          3:       "#E8E5E0",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          warm:    "#FDFCFA",
          2:       "#F7F5F2",
        },
        // Ink — warm charcoal
        ink: {
          DEFAULT: "#1E1C1A",
          soft:    "#3D3A36",
          muted:   "#6B6460",
          subtle:  "#9D9590",
        },
        border: {
          DEFAULT: "#E4E0DB",
          soft:    "#EDE9E4",
          strong:  "#CCC8C2",
        },
        // Dark mode
        dark: {
          base:     "#1A1816",
          surface:  "#242220",
          "surface-2": "#2E2C29",
          border:   "#3A3733",
          ink:      "#F0EDE8",
          muted:    "#8A8480",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Plus Jakarta Sans", "DM Sans", "sans-serif"],
        body:    ["var(--font-body)",    "DM Sans", "sans-serif"],
        jp:      ["var(--font-jp)",      "Noto Sans JP", "sans-serif"],
        mono:    ["var(--font-mono)",    "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card:  "16px",
        chip:  "12px",
        badge: "8px",
        pill:  "999px",
      },
      boxShadow: {
        card:       "0 2px 12px -2px rgba(30,28,26,0.07), 0 1px 3px rgba(0,0,0,0.03)",
        "card-md":  "0 4px 20px -4px rgba(30,28,26,0.10), 0 2px 6px rgba(0,0,0,0.05)",
        "card-lg":  "0 8px 32px -6px rgba(30,28,26,0.13), 0 2px 8px rgba(0,0,0,0.06)",
        sidebar:    "2px 0 16px rgba(0,0,0,0.05)",
        modal:      "0 24px 64px -12px rgba(30,28,26,0.20), 0 4px 12px rgba(0,0,0,0.08)",
        "pro-glow": "0 0 0 3px rgba(201,169,110,0.25)",
      },
      animation: {
        "fade-in":    "fadeIn 0.2s ease-in-out",
        "slide-up":   "slideUp 0.3s cubic-bezier(0.16,1,0.32,1)",
        "slide-down": "slideDown 0.3s cubic-bezier(0.16,1,0.32,1)",
        "scale-in":   "scaleIn 0.2s cubic-bezier(0.16,1,0.32,1)",
        "shake":      "shake 240ms ease-in-out",
        "xp-burst":   "xpBurst 700ms cubic-bezier(0.16,1,0.32,1) forwards",
        "cert-in":    "certIn 500ms cubic-bezier(0.16,1,0.32,1)",
        "pulse-ring": "pulseRing 1.8s cubic-bezier(0.16,1,0.32,1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%":   { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%":      { transform: "translateX(5px)" },
          "40%":      { transform: "translateX(-5px)" },
          "60%":      { transform: "translateX(4px)" },
          "80%":      { transform: "translateX(-4px)" },
        },
        xpBurst: {
          "0%":   { opacity: "0", transform: "translateY(0)" },
          "20%":  { opacity: "1" },
          "100%": { opacity: "0", transform: "translateY(-32px)" },
        },
        certIn: {
          from: { opacity: "0", transform: "scale(0.96) translateY(8px)" },
          to:   { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        pulseRing: {
          "0%":   { boxShadow: "0 0 0 0 rgba(91,106,191,0.40)" },
          "70%":  { boxShadow: "0 0 0 10px rgba(91,106,191,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(91,106,191,0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
