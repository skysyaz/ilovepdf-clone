import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";

/**
 * Supported app languages. Add a new locale by:
 *   1. Adding it here
 *   2. Adding the matching `messages/<code>.json` file
 *   3. Adding the flag in `LanguageSwitcher`
 */
export const locales = ["en", "ms"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(locales, requested) ? requested : defaultLocale;
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
