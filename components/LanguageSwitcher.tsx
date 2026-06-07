"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, locales } from "@/i18n/navigation";
import { useTransition } from "react";

/**
 * Two-locale switcher (English / Bahasa Melayu). Replaces the URL prefix
 * when the user picks a different language, so deep links survive the
 * switch (e.g. `/merge` → `/ms/merge`).
 */
export default function LanguageSwitcher() {
  const t = useTranslations("languages");
  const current = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function switchTo(next: string) {
    if (next === current) return;
    startTransition(() => {
      // @ts-ignore — next-intl types the pathname as a LocalizedPathname but
      // accepts a plain string at runtime.
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div className="flex items-center rounded-xl border border-gray-200 bg-white p-0.5 text-xs font-medium dark:border-gray-700 dark:bg-surface-dark">
      {locales.map((code) => {
        const active = code === current;
        return (
          <button
            key={code}
            type="button"
            onClick={() => switchTo(code)}
            disabled={pending}
            aria-label={`Switch language to ${t(code)}`}
            className={`rounded-lg px-2 py-1 transition ${
              active
                ? "bg-brand text-white"
                : "text-gray-600 hover:text-brand dark:text-gray-300"
            }`}
          >
            {code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
