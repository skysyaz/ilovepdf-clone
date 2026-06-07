import { defineRouting } from "next-intl/routing";
import { locales, defaultLocale } from "./request";

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  // Don't prefix the default locale in the URL (/en/foo would be /foo).
  // Other locales get a /<locale>/ prefix.
  localePrefix: "as-needed",
});
