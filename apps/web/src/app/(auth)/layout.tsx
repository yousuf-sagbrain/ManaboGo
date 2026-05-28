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
    <div
      style={{
        minHeight: "100vh",
        background: "var(--page)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative petal circles */}
      <div style={{
        position: "absolute", top: "-120px", left: "-120px",
        width: "380px", height: "380px", borderRadius: "50%",
        background: "radial-gradient(circle, var(--sakura), transparent 70%)",
        opacity: 0.08, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "-60px", right: "-80px",
        width: "300px", height: "300px", borderRadius: "50%",
        background: "radial-gradient(circle, var(--sakura), transparent 70%)",
        opacity: 0.08, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-100px", left: "15%",
        width: "340px", height: "340px", borderRadius: "50%",
        background: "radial-gradient(circle, var(--sakura), transparent 70%)",
        opacity: 0.08, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-80px", right: "-60px",
        width: "260px", height: "260px", borderRadius: "50%",
        background: "radial-gradient(circle, var(--sakura), transparent 70%)",
        opacity: 0.08, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "40%", left: "-100px",
        width: "220px", height: "220px", borderRadius: "50%",
        background: "radial-gradient(circle, var(--sakura), transparent 70%)",
        opacity: 0.08, pointerEvents: "none",
      }} />

      {/* Auth card */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "420px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 4px 24px 0 rgba(59,130,246,0.07), 0 1px 4px 0 rgba(26,31,60,0.06)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
