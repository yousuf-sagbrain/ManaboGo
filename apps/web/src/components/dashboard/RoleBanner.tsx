/** Phase 0 Scaffold banner — shown in development only. */

interface RoleBannerProps {
  role: string;
  email: string;
  fullName?: string | null;
}

export function RoleBanner({ role, email, fullName }: RoleBannerProps) {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="phase0-banner">
      🚧 Phase 0 Scaffold — Role:{" "}
      <strong>{role}</strong> · User:{" "}
      <strong>{fullName ?? email}</strong>
    </div>
  );
}
