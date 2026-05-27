/**
 * next-intl configuration for Next.js App Router.
 * Used by createNextIntlPlugin in next.config.ts.
 */

import { getRequestConfig } from "next-intl/server";

const SUPPORTED_LOCALES = ["en", "ja", "bn", "id", "vi"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // Validate that the incoming locale is supported
  let locale = await requestLocale;
  if (!locale || !SUPPORTED_LOCALES.includes(locale as Locale)) {
    locale = "en";
  }

  const messages = await import(`./locales/${locale}.json`);

  return {
    locale,
    messages: messages.default,
  };
});
