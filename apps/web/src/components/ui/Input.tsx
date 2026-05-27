import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            "border rounded-xl px-4 py-3 text-slate-900 text-sm",
            "placeholder:text-slate-400 outline-none transition-all duration-150",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-slate-200 focus:border-sakura focus:ring-2 focus:ring-sakura/20",
            "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
        {hint && !error && (
          <p className="text-xs text-slate-400 mt-0.5">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
