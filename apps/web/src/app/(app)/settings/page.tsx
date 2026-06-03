"use client";

import { useRef, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge, RoleBadge } from "@/components/ui/Badge";
import { PasswordStrengthBar } from "@/components/ui/PasswordStrengthBar";
import { apiFetch } from "@/lib/api";
import type { SessionInfo, UserProfile } from "@manabogo/shared";
import { useRouter } from "next/navigation";

type Tab = "profile" | "security" | "sessions" | "privacy";

// ── Shared section card wrapper ───────────────────────────────
function Section({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ paddingBottom: 24, marginBottom: 24, borderBottom: "1px solid var(--border-soft)" }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--ink)", margin: "0 0 4px 0" }}>{title}</h3>
        {description && <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: 0, lineHeight: 1.5 }}>{description}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Alert banners ─────────────────────────────────────────────
function AlertSuccess({ msg }: { msg: string }) {
  return (
    <div style={{ background: "var(--sage-tint)", border: "1px solid var(--sage-ring)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--sage-hover)", marginBottom: 16 }}>
      {msg}
    </div>
  );
}
function AlertError({ msg }: { msg: string }) {
  return (
    <div style={{ background: "var(--coral-tint)", border: "1px solid var(--coral-ring)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--coral-hover)", marginBottom: 16 }}>
      {msg}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const user = useAuthStore((s) => s.user);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "profile",  label: "Profile",       icon: "👤" },
    { id: "security", label: "Security",      icon: "🔒" },
    { id: "sessions", label: "Sessions",      icon: "📱" },
    { id: "privacy",  label: "Data & Privacy",icon: "🛡️" },
  ];

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "var(--base)" }}>
      <div className="page-pad" style={{ maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Header */}
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(20px, 5vw, 26px)", color: "var(--ink)", margin: "0 0 6px 0" }}>
            Settings
          </h1>
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "var(--ink-muted)" }}>{user.email}</span>
              <RoleBadge role={user.role} />
            </div>
          )}
        </div>

        {/* Tab bar — scrollable on mobile so all 4 tabs fit */}
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }} className="no-scrollbar">
          <div style={{ display: "flex", borderBottom: "1.5px solid var(--border-soft)", minWidth: "max-content" }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "10px 16px",
                    fontSize: 13, fontWeight: isActive ? 600 : 500,
                    color: isActive ? "var(--accent)" : "var(--ink-muted)",
                    background: "none", border: "none", cursor: "pointer",
                    borderBottom: `2px solid ${isActive ? "var(--accent)" : "transparent"}`,
                    marginBottom: -1.5,
                    transition: "color 150ms ease, border-color 150ms ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span style={{ fontSize: 15 }}>{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content card */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 20, padding: "clamp(18px, 4vw, 28px)", boxShadow: "var(--shadow-card)", marginBottom: 16 }}>
          {activeTab === "profile"  && <ProfileTab />}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "sessions" && <SessionsTab />}
          {activeTab === "privacy"  && <PrivacyTab />}
        </div>

      </div>
    </div>
  );
}

// ── Profile tab ───────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function ProfileTab() {
  const user         = useAuthStore((s) => s.user);
  const setAuth      = useAuthStore((s) => s.setAuth);
  const accessToken  = useAuthStore((s) => s.accessToken);
  const [fullName, setFullName]               = useState(user?.fullName ?? "");
  const [isSaving, setIsSaving]               = useState(false);
  const [message, setMessage]                 = useState("");
  const fileInputRef                          = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview]     = useState<string | null>((user as any)?.avatarUrl ?? null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError]         = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    try {
      const updated = await apiFetch<UserProfile>("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ full_name: fullName }),
      });
      if (user && accessToken) {
        setAuth(accessToken, { ...user, fullName: updated.full_name });
      }
      setMessage("Profile updated successfully.");
    } catch {
      setMessage("error:Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError("");
    if (!["image/jpeg","image/png","image/webp"].includes(file.type)) {
      setAvatarError("Only JPEG, PNG, or WebP images are allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Image must be 2 MB or smaller.");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setIsUploadingAvatar(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const resp = await fetch(`${API_URL}/users/me/avatar`, {
        method: "POST",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        body: form,
        credentials: "include",
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail ?? "Upload failed.");
      }
      const { avatar_url } = await resp.json();
      URL.revokeObjectURL(objectUrl);
      setAvatarPreview(avatar_url);
      if (user && accessToken) {
        setAuth(accessToken, { ...user, avatarUrl: avatar_url } as any);
      }
    } catch (err: unknown) {
      URL.revokeObjectURL(objectUrl);
      setAvatarPreview((user as any)?.avatarUrl ?? null);
      setAvatarError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const initials = (user?.fullName ?? user?.email ?? "U")[0].toUpperCase();
  const isError   = message.startsWith("error:");
  const displayMsg = message.replace(/^error:/, "");

  return (
    <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <Section title="Personal info" description="Your display name shown across the app.">
        {displayMsg && (isError ? <AlertError msg={displayMsg} /> : <AlertSuccess msg={displayMsg} />)}

        {/* Avatar row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            aria-label="Change avatar"
            style={{ position: "relative", width: 64, height: 64, borderRadius: "50%", overflow: "hidden", background: "var(--accent-tint-2)", border: "2px solid var(--accent-ring)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, flexShrink: 0, cursor: "pointer" }}
          >
            {avatarPreview
              ? <img src={avatarPreview} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span>{initials}</span>
            }
            {isUploadingAvatar && (
              <span style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg style={{ width: 20, height: 20, color: "#fff" }} className="animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </span>
            )}
          </button>
          <div>
            <Button type="button" variant="secondary" size="sm" disabled={isUploadingAvatar} onClick={() => fileInputRef.current?.click()}>
              {isUploadingAvatar ? "Uploading…" : "Upload photo"}
            </Button>
            <p style={{ fontSize: 11, color: "var(--ink-subtle)", marginTop: 4 }}>JPEG, PNG, or WebP · max 2 MB</p>
            {avatarError && <p style={{ fontSize: 11, color: "var(--coral)", marginTop: 2 }}>{avatarError}</p>}
          </div>
        </div>

        <Input
          label="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your name"
        />
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleAvatarChange} />
      </Section>

      <div style={{ paddingTop: 4 }}>
        <Button type="submit" isLoading={isSaving}>Save changes</Button>
      </div>
    </form>
  );
}

// ── Security tab ──────────────────────────────────────────────
function SecurityTab() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw]         = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [message, setMessage]     = useState("");
  const [error, setError]         = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setMessage("");
    if (newPw !== confirmPw) { setError("Passwords do not match."); return; }
    setIsChanging(true);
    try {
      await apiFetch("/users/me/change-password", {
        method: "POST",
        body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
      });
      setMessage("Password updated successfully.");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (e: any) {
      setError(e.body?.detail ?? "Failed to change password.");
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <Section title="Change password" description="Use a strong password of at least 10 characters.">
        <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {message && <AlertSuccess msg={message} />}
          {error   && <AlertError   msg={error}   />}
          <Input label="Current password"  type="password" value={currentPw}  onChange={(e) => setCurrentPw(e.target.value)}  required />
          <div>
            <Input label="New password"    type="password" value={newPw}      onChange={(e) => setNewPw(e.target.value)}      required />
            <PasswordStrengthBar password={newPw} />
          </div>
          <Input
            label="Confirm new password"
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            required
            error={confirmPw && newPw !== confirmPw ? "Passwords do not match." : undefined}
          />
          <Button type="submit" isLoading={isChanging}>Update password</Button>
        </form>
      </Section>

      <Section title="Two-factor authentication" description="Add an extra layer of security to your account.">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--base)", border: "1px solid var(--border-soft)", borderRadius: 12, padding: "14px 16px", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", margin: "0 0 2px 0" }}>Authenticator app</p>
            <p style={{ fontSize: 12, color: "var(--ink-muted)", margin: 0 }}>Use Google Authenticator or Authy.</p>
          </div>
          <Badge label="Not configured" color="slate" />
        </div>
        <div style={{ marginTop: 12 }}>
          <Button variant="secondary" size="sm" onClick={() => alert("Use /auth/2fa/setup endpoint to configure 2FA.")}>Enable 2FA</Button>
        </div>
      </Section>
    </div>
  );
}

// ── Sessions tab ──────────────────────────────────────────────
function SessionsTab() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<SessionInfo[]>("/users/me/sessions");
      setSessions(data);
      setIsLoaded(true);
    } catch {}
    setIsLoading(false);
  };

  const revokeSession = async (id: string) => {
    try {
      await apiFetch(`/users/me/sessions/${id}`, { method: "DELETE" });
      setSessions((s) => s.filter((sess) => sess.id !== id));
    } catch {}
  };

  if (!isLoaded) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 16 }}>View all devices where you&apos;re currently signed in.</p>
        <Button variant="secondary" isLoading={isLoading} onClick={loadSessions}>Load active sessions</Button>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--ink)", margin: "0 0 16px 0" }}>Active sessions</h3>
      {sessions.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--ink-muted)" }}>No active sessions found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sessions.map((session) => (
            <div key={session.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "var(--base)", border: "1px solid var(--border-soft)", borderRadius: 12, padding: "13px 16px", flexWrap: "wrap" }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", margin: "0 0 2px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {session.user_agent ?? "Unknown device"}
                </p>
                <p style={{ fontSize: 12, color: "var(--ink-muted)", margin: 0 }}>
                  {session.ip_address} · Last seen {new Date(session.last_seen).toLocaleString()}
                </p>
              </div>
              <Button variant="danger" size="sm" onClick={() => revokeSession(session.id)}>Revoke</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Privacy tab ───────────────────────────────────────────────
function PrivacyTab() {
  const router    = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isExporting, setIsExporting]         = useState(false);
  const [isDeleting,  setIsDeleting]          = useState(false);
  const [exportMsg,   setExportMsg]           = useState("");

  const handleExport = async () => {
    setIsExporting(true);
    setExportMsg("");
    try {
      const data = await apiFetch<object>("/users/me/gdpr-export", { method: "GET" });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url;
      a.download = "manabogo-data-export.json";
      a.click();
      URL.revokeObjectURL(url);
      setExportMsg("Download started.");
    } catch {
      setExportMsg("error:Export failed. Please try again.");
    }
    setIsExporting(false);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await apiFetch("/users/me", { method: "DELETE" });
      clearAuth();
      router.push("/");
    } catch {
      setIsDeleting(false);
    }
  };

  const isExportError = exportMsg.startsWith("error:");
  const exportDisplay = exportMsg.replace(/^error:/, "");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <Section title="Export your data" description="Download all your ManaboGo data including progress, achievements, and account info.">
        {exportDisplay && (isExportError ? <AlertError msg={exportDisplay} /> : <AlertSuccess msg={exportDisplay} />)}
        <Button variant="secondary" isLoading={isExporting} onClick={handleExport}>Export my data</Button>
      </Section>

      <div>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--coral)", margin: "0 0 4px 0" }}>Delete account</h3>
        <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: "0 0 16px 0", lineHeight: 1.5 }}>
          Your account will be deactivated immediately with a 30-day recovery window.
        </p>
        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>Delete my account</Button>
      </div>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete account" size="sm">
        <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: "0 0 20px 0", lineHeight: 1.6 }}>
          Are you sure? Your account will be scheduled for deletion in 30 days. Log in within that period to cancel.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="secondary" fullWidth onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" fullWidth isLoading={isDeleting} onClick={handleDeleteAccount}>Yes, delete</Button>
        </div>
      </Modal>
    </div>
  );
}
