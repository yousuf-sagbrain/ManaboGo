"use client";

interface PasswordStrengthBarProps {
  password: string;
}

type Strength = "empty" | "weak" | "fair" | "strong";

function getStrength(password: string): { level: Strength; score: number; label: string } {
  if (!password) return { level: "empty", score: 0, label: "" };

  let score = 0;
  if (password.length >= 10) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  if (score <= 2) return { level: "weak", score, label: "Weak" };
  if (score <= 3) return { level: "fair", score, label: "Fair" };
  return { level: "strong", score, label: "Strong" };
}

const LEVEL_COLORS: Record<Strength, string> = {
  empty: "bg-slate-200",
  weak: "bg-red-400",
  fair: "bg-amber-400",
  strong: "bg-jade",
};

const LABEL_COLORS: Record<Strength, string> = {
  empty: "text-slate-400",
  weak: "text-red-500",
  fair: "text-amber-600",
  strong: "text-jade",
};

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const { level, score, label } = getStrength(password);

  if (!password) return null;

  const filledBars = Math.max(1, score);

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={[
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              i <= filledBars ? LEVEL_COLORS[level] : "bg-slate-100",
            ].join(" ")}
          />
        ))}
      </div>
      {label && (
        <p className={`text-xs font-medium ${LABEL_COLORS[level]}`}>{label}</p>
      )}
    </div>
  );
}
