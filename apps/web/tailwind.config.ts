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
        // ManaboGo design tokens — mirrors tokens.css
        sakura: {
          DEFAULT: "#3B82F6",
          press:   "#2563EB",
          ring:    "#BFDBFE",
        },
        ink: {
          DEFAULT: "#1A1F3C",
          soft:    "#2A2F4F",
        },
        indigo: {
          DEFAULT: "#7C3AED",
          tint:    "#F3EFFE",
        },
        gold:  "#FFD166",
        mint: {
          DEFAULT: "#06D6A0",
          soft:    "#04B888",
          tint:    "#EDFFF9",
        },
        page:    "#FAFAF9",
        surface: {
          DEFAULT: "#FFFFFF",
          2:       "#F7F7F4",
        },
        border: {
          DEFAULT: "#E8E8E8",
          soft:    "#F0F0EE",
        },
        muted: {
          DEFAULT: "#6B7280",
          soft:    "#9CA3AF",
        },
        body:   "#2A2F3E",
        danger: "#FF4757",
        amber:  "#F59E0B",
      },
      fontFamily: {
        display: ["var(--font-display)", "Nunito", "sans-serif"],
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
        card: "0 4px 14px -4px rgba(26,31,60,0.08), 0 1px 3px rgba(0,0,0,0.04)",
        "card-hover": "0 8px 24px -6px rgba(26,31,60,0.14), 0 2px 6px rgba(0,0,0,0.06)",
        sidebar: "2px 0 20px rgba(0,0,0,0.06)",
      },
      animation: {
        "fade-in":  "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "shake":    "shake 240ms ease-in-out",
        "xp-burst": "xpBurst 700ms cubic-bezier(0.16,1,0.32,1) forwards",
        "cert-in":  "certIn 500ms cubic-bezier(0.16,1,0.32,1)",
        "pulse-dot":"pulse 1.6s cubic-bezier(0.16,1,0.32,1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%":      { transform: "translateX(4px)" },
          "40%":      { transform: "translateX(-4px)" },
          "60%":      { transform: "translateX(4px)" },
          "80%":      { transform: "translateX(-4px)" },
        },
        xpBurst: {
          "0%":   { opacity: "0", transform: "translateY(0)" },
          "20%":  { opacity: "1" },
          "100%": { opacity: "0", transform: "translateY(-28px)" },
        },
        certIn: {
          from: { opacity: "0", transform: "scale(0.96)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        pulse: {
          "0%":   { boxShadow: "0 0 0 0 rgba(59,130,246,0.55)" },
          "70%":  { boxShadow: "0 0 0 8px rgba(59,130,246,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(59,130,246,0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
