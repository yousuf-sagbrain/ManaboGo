import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Noto_Sans_JP } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

// ── Fonts ──────────────────────────────────────────────────────
const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

// ── Root metadata ──────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "ManaboGo — Learn Japanese for JLPT N5",
    template: "%s | ManaboGo",
  },
  description:
    "ManaboGo is the first platform offering an accredited online JLPT N5 certificate, combining adaptive SRS, AI-powered readiness reports, and a global learner community across 30+ countries.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    siteName: "ManaboGo",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${notoSansJP.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="font-body bg-slate-50 text-slate-900 antialiased"
        style={{
          fontFamily: "var(--font-body)",
        }}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
