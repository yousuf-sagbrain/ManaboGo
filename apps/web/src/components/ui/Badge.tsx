import { Role } from "@manabogo/shared";

interface BadgeProps {
  role: Role | string;
  className?: string;
}

const ROLE_BADGE_CLASSES: Record<string, string> = {
  user: "bg-slate-100 text-slate-600",
  pro_user: "bg-pink-50 text-[#FF6B9D] border border-[#FF6B9D]/20",
  admin: "bg-indigo-50 text-indigo-600 border border-indigo-200",
  super_admin: "bg-amber-50 text-amber-700 border border-amber-200",
};

const ROLE_LABELS: Record<string, string> = {
  user: "Free",
  pro_user: "Pro",
  admin: "Admin",
  super_admin: "Super Admin",
};

export function RoleBadge({ role, className = "" }: BadgeProps) {
  const classes = ROLE_BADGE_CLASSES[role] ?? "bg-slate-100 text-slate-600";
  const label = ROLE_LABELS[role] ?? role;

  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        classes,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label}
    </span>
  );
}

/** Generic badge for other uses. */
interface GenericBadgeProps {
  label: string;
  color?: "green" | "red" | "amber" | "blue" | "slate";
  className?: string;
}

const COLOR_CLASSES: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  red: "bg-red-50 text-red-700 border border-red-200",
  amber: "bg-amber-50 text-amber-700 border border-amber-200",
  blue: "bg-blue-50 text-blue-700 border border-blue-200",
  slate: "bg-slate-100 text-slate-600",
};

export function Badge({ label, color = "slate", className = "" }: GenericBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        COLOR_CLASSES[color],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label}
    </span>
  );
}
