import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export function Card({ title, description, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={[
        "bg-white rounded-2xl shadow-sm border border-slate-100 p-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

/** Placeholder card used in dashboard stubs. */
export function PlaceholderCard({
  title,
  height = "h-32",
}: {
  title: string;
  height?: string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-dashed border-slate-200 p-5 ${height} flex flex-col items-center justify-center gap-2`}
    >
      <p className="text-sm font-medium text-slate-400">{title}</p>
      <p className="text-xs text-slate-300">Coming in a later phase</p>
    </div>
  );
}
