"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import ChatPanel from "@/components/ChatPanel";

/**
 * Floating chat launcher. Hidden by default; click the bubble to open
 * a small panel in the bottom-right. Closes on outside-click.
 */
export default function ChatBubble() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-16 right-4 z-50 grid h-13 w-13 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-hover text-white shadow-[0_12px_30px_-8px] shadow-brand/50 transition hover:scale-105 sm:bottom-5 sm:right-5"
        style={{ height: "3.25rem", width: "3.25rem" }}
      >
        {open ? (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            className="card fixed bottom-32 right-4 z-50 flex h-[min(560px,70vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden sm:bottom-24 sm:right-5"
            role="dialog"
            aria-label="Chat"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="text-sm font-semibold text-ink dark:text-ink-dark">
                iLovePDF Chat
              </p>
              <Link
                href="/chat"
                className="text-xs text-brand hover:underline"
                onClick={() => setOpen(false)}
              >
                Open full chat →
              </Link>
            </div>
            <ChatPanel variant="bubble" />
          </div>
        </>
      )}
    </>
  );
}