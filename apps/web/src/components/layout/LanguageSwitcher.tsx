"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

const LOCALES = [
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "bn", label: "বাংলা" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "vi", label: "Tiếng Việt" },
] as const;

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Detect current locale from pathname
  const currentLocale =
    LOCALES.find((l) => pathname.startsWith(`/${l.code}/`) || pathname === `/${l.code}`)
      ?.code ?? "en";

  const currentLabel = LOCALES.find((l) => l.code === currentLocale)?.label ?? "English";

  const handleSelect = (code: string) => {
    setIsOpen(false);
    // Set locale cookie for persistence
    document.cookie = `manabogo_locale=${code}; path=/; max-age=${365 * 24 * 3600}; SameSite=Strict`;

    // Replace the locale segment in the pathname
    const segments = pathname.split("/").filter(Boolean);
    const isLocaleSegment = LOCALES.some((l) => l.code === segments[0]);
    const newPath = isLocaleSegment
      ? `/${code}/${segments.slice(1).join("/")}`.replace(/\/$/, "")
      : `/${code}${pathname}`;

    router.push(newPath || `/${code}`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-100"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span>{currentLabel}</span>
        <svg className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <ul
            role="listbox"
            className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 animate-slide-up"
          >
            {LOCALES.map((locale) => (
              <li key={locale.code}>
                <button
                  role="option"
                  aria-selected={locale.code === currentLocale}
                  onClick={() => handleSelect(locale.code)}
                  className={[
                    "w-full text-left px-4 py-2 text-sm transition-colors",
                    locale.code === currentLocale
                      ? "text-sakura font-semibold bg-pink-50"
                      : "text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {locale.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
