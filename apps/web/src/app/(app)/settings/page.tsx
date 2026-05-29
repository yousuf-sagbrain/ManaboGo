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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const user = useAuthStore((s) => s.user);

  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "security", label: "Security" },
    { id: "sessions", label: "Sessions" },
    { id: "privacy", label: "Data & Privacy" },
  ];

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 font-display">Settings</h1>
        {user && (
          <div className="flex items-center gap-2 mt-2">
            <p className="text-sm text-slate-500">{user.email}</p>
            <RoleBadge role={user.role} />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && <ProfileTab />}
      {activeTab === "security" && <SecurityTab />}
      {activeTab === "sessions" && <SessionsTab />}
      {activeTab === "privacy" && <PrivacyTab />}
    </div>
  );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function ProfileTab() {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Avatar state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl ?? null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await apiFetch<UserProfile>("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ full_name: fullName }),
      });
      if (user && accessToken) {
        setAuth(accessToken, { ...user, fullName: updated.full_name });
      }
      setMessage("Profile updated.");
    } catch {
      setMessage("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError("");

    // Client-side guard — mirrors backend limits
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setAvatarError("Only JPEG, PNG, or WebP images are allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Image must be 2 MB or smaller.");
      return;
    }

    // Optimistic local preview
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setIsUploadingAvatar(true);

    try {
      const form = new FormData();
      form.append("file", file);

      // Raw fetch — apiFetch forces application/json which breaks multipart
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

      // Swap optimistic blob URL for the permanent server URL
      URL.revokeObjectURL(objectUrl);
      setAvatarPreview(avatar_url);

      if (user && accessToken) {
        setAuth(accessToken, { ...user, avatarUrl: avatar_url });
      }
    } catch (err: unknown) {
      URL.revokeObjectURL(objectUrl);
      setAvatarPreview(user?.avatarUrl ?? null);
      setAvatarError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploadingAvatar(false);
      // Reset input so the same file can be re-selected after an error
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const initials = (user?.fullName ?? user?.email ?? "U")[0].toUpperCase();

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {message && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}
      <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
      <div>
        <label className="text-sm font-medium text-slate-700 block mb-1.5">Avatar</label>
        <div className="flex items-center gap-4">
          {/* Avatar preview — image if uploaded, initials fallback */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="relative w-16 h-16 rounded-full overflow-hidden bg-sakura/10 flex items-center justify-center text-sakura font-bold text-xl flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="Change avatar"
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
            {isUploadingAvatar && (
              <span className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </span>
            )}
          </button>

          <div className="space-y-1">
            <Button
              type="button"
              variant="secondary"
              disabled={isUploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploadingAvatar ? "Uploading…" : "Upload photo"}
            </Button>
            <p className="text-xs text-slate-400">JPEG, PNG, or WebP · max 2 MB</p>
            {avatarError && <p className="text-xs text-red-500">{avatarError}</p>}
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleAvatarChange}
        />
      </div>
      <Button type="submit" isLoading={isSaving}>Save changes</Button>
    </form>
  );
}

function SecurityTab() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
    <div className="space-y-8">
      <form onSubmit={handleChangePassword} className="space-y-5">
        <h3 className="text-base font-semibold text-slate-900">Change password</h3>
        {message && <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">{message}</div>}
        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}
        <Input label="Current password" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required />
        <div>
          <Input label="New password" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required />
          <PasswordStrengthBar password={newPw} />
        </div>
        <Input label="Confirm new password" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required error={confirmPw && newPw !== confirmPw ? "Passwords do not match." : undefined} />
        <Button type="submit" isLoading={isChanging}>Update password</Button>
      </form>
      <div className="pt-6 border-t border-slate-100">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Two-factor authentication</h3>
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div>
            <p className="text-sm font-medium text-slate-900">Authenticator app</p>
            <p className="text-xs text-slate-500 mt-0.5">Use Google Authenticator or Authy.</p>
          </div>
          <Badge label="Not configured" color="slate" />
        </div>
        <Button variant="secondary" className="mt-4" onClick={() => alert("Use /auth/2fa/setup endpoint to configure 2FA.")}>Enable 2FA</Button>
      </div>
    </div>
  );
}

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
      <div className="text-center py-8">
        <Button variant="secondary" isLoading={isLoading} onClick={loadSessions}>Load active sessions</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-slate-900">Active sessions</h3>
      {sessions.length === 0 ? (
        <p className="text-sm text-slate-500">No active sessions found.</p>
      ) : (
        sessions.map((session) => (
          <div key={session.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl">
            <div>
              <p className="text-sm font-medium text-slate-900">{session.user_agent ?? "Unknown device"}</p>
              <p className="text-xs text-slate-500">{session.ip_address} · Last seen {new Date(session.last_seen).toLocaleString()}</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => revokeSession(session.id)}>Revoke</Button>
          </div>
        ))
      )}
    </div>
  );
}

function PrivacyTab() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exportMsg, setExportMsg] = useState("");

  const handleExport = async () => {
    setIsExporting(true);
    setExportMsg("");
    try {
      const data = await apiFetch<object>("/users/me/gdpr-export", { method: "GET" });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "manabogo-data-export.json";
      a.click();
      URL.revokeObjectURL(url);
      setExportMsg("Download started.");
    } catch {
      setExportMsg("Export failed. Please try again.");
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">Export your data</h3>
        <p className="text-sm text-slate-500 mb-4">Download all your ManaboGo data including progress, achievements, and account info.</p>
        {exportMsg && <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700 mb-4">{exportMsg}</div>}
        <Button variant="secondary" isLoading={isExporting} onClick={handleExport}>Export my data</Button>
      </div>
      <div className="pt-6 border-t border-slate-100">
        <h3 className="text-base font-semibold text-red-600 mb-1">Delete account</h3>
        <p className="text-sm text-slate-500 mb-4">Your account will be deactivated immediately with a 30-day recovery window.</p>
        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>Delete my account</Button>
      </div>
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete account" size="sm">
        <p className="text-sm text-slate-600 mb-5">Are you sure? Your account will be scheduled for deletion in 30 days. Log in within that period to cancel.</p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" fullWidth isLoading={isDeleting} onClick={handleDeleteAccount}>Yes, delete</Button>
        </div>
      </Modal>
    </div>
  );
}
