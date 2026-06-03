/** Auth route group layout — centered card, no nav. */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | ManaboGo",
    default: "ManaboGo",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "100dvh",
      background: "var(--base)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px 12px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Subtle warm radial tints — purely decorative */}
      <div style={{
        position: "absolute", top: "-100px", right: "-60px",
        width: "400px", height: "400px", borderRadius: "50%",
        background: "radial-gradient(circle, var(--accent-tint-2), transparent 70%)",
        opacity: 0.8, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-80px", left: "-80px",
        width: "340px", height: "340px", borderRadius: "50%",
        background: "radial-gradient(circle, var(--pro-ring), transparent 70%)",
        opacity: 0.5, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "-60px",
        width: "200px", height: "200px", borderRadius: "50%",
        background: "radial-gradient(circle, var(--sage-ring), transparent 70%)",
        opacity: 0.4, pointerEvents: "none",
      }} />

      {/* Auth card */}
      <div
        className="animate-slide-up auth-card-inner"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 420,
          background: "var(--surface)",
          border: "1px solid var(--border-soft)",
          borderRadius: 20,
          padding: "36px 32px",
          boxShadow: "var(--shadow-card-md)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
