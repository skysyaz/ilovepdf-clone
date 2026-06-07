"use client";

import { useTheme } from "@/components/ThemeProvider";

/**
 * Three-way theme toggle: light / dark / system. Compact icon-only button
 * suitable for the navbar. Cycles through the three modes on click.
 */
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const next: "light" | "dark" | "system" =
    theme === "light" ? "dark" : theme === "dark" ? "system" : "light";

  const label =
    theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Theme: ${label}. Click to switch to ${next}.`}
      title={`Theme: ${label} → ${next}`}
      className="grid h-9 w-9 place-items-center rounded-xl border border-gray-200 bg-white text-ink transition hover:border-brand hover:text-brand dark:border-gray-700 dark:bg-surface-dark dark:text-ink-dark"
    >
      {theme === "light" && (
        // Sun
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      )}
      {theme === "dark" && (
        // Moon
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
      {theme === "system" && (
        // Monitor
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      )}
    </button>
  );
}
