"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const SW_URL = "/sw.js";

/**
 * Registers the service worker and listens for the install prompt so
 * we can show a small "Install app" button in the navbar. Silent if
 * the browser doesn't support either feature.
 */
export default function PWAInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // Register the service worker. Use a relative URL so it works on
    // any host (workers.dev, custom domain, localhost).
    navigator.serviceWorker
      .register(SW_URL, { scope: "/" })
      .catch((err) => {
        // Don't crash the app on a SW registration error — just log.
        console.warn("[pwa] service worker registration failed:", err);
      });

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || !deferred) return null;

  async function handleInstall() {
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {
      /* ignore */
    }
    setDeferred(null);
  }

  return (
    <button
      type="button"
      onClick={handleInstall}
      className="hidden items-center gap-1.5 rounded-xl bg-brand/10 px-3 py-2 text-sm font-medium text-brand transition hover:bg-brand/15 sm:inline-flex"
      title="Install this app on your device"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 5v14M5 12l7 7 7-7" />
      </svg>
      Install
    </button>
  );
}
