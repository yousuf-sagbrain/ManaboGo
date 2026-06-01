"use client";

import { useEffect, useRef } from "react";
import { StrokeAnimCard } from "./StrokeAnimCard";

interface Props {
  character: string | null;
  romaji?:   string;
  onClose:   () => void;
}

const overlayAnim = `
@keyframes sma-fade-in  { from { opacity: 0 } to { opacity: 1 } }
@keyframes sma-pop      { from { opacity: 0; transform: translate(-50%,-50%) scale(0.9) } to { opacity: 1; transform: translate(-50%,-50%) scale(1) } }
`;

export function StrokeAnimModal({ character, romaji, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (character !== null) {
      if (!d.open) d.showModal();
    } else {
      if (d.open) d.close();
    }
  }, [character]);

  // Close on backdrop click
  const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  // Close on Escape
  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onClose();
  };

  if (character === null) return null;

  return (
    <>
      <style>{overlayAnim}</style>
      <dialog
        ref={dialogRef}
        onClick={handleClick}
        onCancel={handleCancel}
        style={{
          position: "fixed",
          inset: 0,
          margin: "auto",
          padding: 0,
          border: "none",
          background: "transparent",
          maxWidth: "100vw",
          maxHeight: "100vh",
          overflow: "visible",
        }}
      >
        {/* Backdrop */}
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
          animation: "sma-fade-in 0.18s ease forwards",
          zIndex: -1,
        }} />

        {/* Card */}
        <div style={{
          position: "fixed",
          left: "50%", top: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(340px, 92vw)",
          background: "var(--surface, #fff)",
          borderRadius: 20,
          padding: 20,
          boxShadow: "0 8px 0 rgba(30,44,92,0.05), 0 16px 32px rgba(30,44,92,0.14)",
          maxHeight: "92vh",
          overflowY: "auto",
          animation: "sma-pop 0.22s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}>
          <StrokeAnimCard character={character} romaji={romaji} onClose={onClose} />
        </div>
      </dialog>
    </>
  );
}
