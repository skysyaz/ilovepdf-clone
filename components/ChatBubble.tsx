"use client";

import { useState } from "react";
import ChatPanel from "@/components/ChatPanel";

/**
 * Floating chat launcher. Hidden by default; click the bubble to open
 * a small panel in the bottom-right. Closes on outside-click or
 * after clicking the "Open full chat" link.
 */
export default function ChatBubble() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Launcher button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-brand text-white shadow-cta transition hover:bg-brand-hover"
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
          {/* Soft backdrop on small screens */}
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          {/* Panel */}
          <div
            className="fixed bottom-24 right-5 z-50 flex h-[560px] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 dark:bg-surface-dark dark:ring-gray-700"
            role="dialog"
            aria-label="Chat"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
              <p className="text-sm font-semibold text-ink dark:text-ink-dark">
                iLovePDF Chat
              </p>
              <a
                href="/chat"
                className="text-xs text-brand hover:underline"
              >
                Open full chat →
              </a>
            </div>
            <ChatPanel variant="bubble" />
          </div>
        </>
      )}
    </>
  );
}
