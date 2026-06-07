"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "ilovepdf.theme";

function readStored(): Theme {
  if (typeof window === "undefined") return "system";
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "light" || v === "dark" || v === "system") return v;
  return "system";
}

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement;
  if (resolved === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

/**
 * Inline script injected into <head> so the right theme class is on
 * <html> before React mounts. Prevents a "light flash" on dark-mode
 * visitors. Keep it tiny and self-contained.
 */
export const themeInitScript = `
(function() {
  try {
    var k = "${STORAGE_KEY}";
    var t = localStorage.getItem(k);
    if (t !== "light" && t !== "dark" && t !== "system") t = "system";
    var dark = t === "dark" || (t === "system" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`.trim();

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  // Initial read after mount (the inline script already set the class).
  useEffect(() => {
    const stored = readStored();
    setThemeState(stored);
    setResolved(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  // Follow OS changes when in "system" mode.
  useEffect(() => {
    if (theme !== "system" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const next: "light" | "dark" = mq.matches ? "dark" : "light";
      setResolved(next);
      applyTheme(next);
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    const r: "light" | "dark" =
      next === "system" ? (systemPrefersDark() ? "dark" : "light") : next;
    setResolved(r);
    applyTheme(r);
  }, []);

  const toggle = useCallback(() => {
    // Smart toggle: if currently in dark (either explicit or system), go light; else go dark.
    const next: Theme = resolved === "dark" ? "light" : "dark";
    setTheme(next);
  }, [resolved, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
