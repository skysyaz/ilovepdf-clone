"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { matchIntent } from "@/lib/intents";
import { Link } from "@/i18n/navigation";

interface Message {
  role: "user" | "system";
  text: string;
  /** Optional tool result for system messages */
  match?: ReturnType<typeof matchIntent>["match"];
  matchedRule?: string | null;
}

/**
 * Reusable chat panel used by both the /chat page and the floating
 * launcher. Stateless aside from the local message log — receives a
 * placeholder/initial value via props.
 */
export default function ChatPanel({
  variant = "page",
}: {
  variant?: "page" | "bubble";
}) {
  const t = useTranslations("chat");
  const tCommon = useTranslations("common");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");

  const examples = (t.raw("examplesList") as string[]) ?? [];
  const compact = variant === "bubble";

  function submit(text: string) {
    const value = (text || "").trim();
    if (!value) return;
    const result = matchIntent(value);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: value },
      {
        role: "system",
        text: result.match
          ? result.match.status === "ready"
            ? t("matched")
            : t("comingSoon")
          : t("noMatch"),
        match: result.match,
        matchedRule: result.matchedRule,
      },
    ]);
    setDraft("");
  }

  return (
    <div className={compact ? "flex h-full flex-col" : "mx-auto flex max-w-3xl flex-col px-4 py-8"}>
      {!compact && (
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-ink dark:text-ink-dark sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-gray-600 dark:text-gray-400">
            {t("subtitle")}
          </p>
        </header>
      )}

      <div className={compact ? "flex-1 space-y-3 overflow-y-auto p-4" : "card flex-1 space-y-3 overflow-y-auto p-4 min-h-[300px] max-h-[60vh]"}>
        {messages.length === 0 && (
          <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:bg-gray-800/50 dark:text-gray-400">
            <p className="mb-2 font-medium text-ink dark:text-ink-dark">{t("examples")}</p>
            <div className="flex flex-wrap gap-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => submit(ex)}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 transition hover:border-brand hover:text-brand dark:border-gray-700 dark:bg-surface-dark dark:text-gray-300"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl bg-brand px-4 py-2 text-sm text-white shadow-cta">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl bg-gray-100 px-4 py-3 text-sm text-ink dark:bg-gray-800 dark:text-ink-dark">
                <p className="mb-2">{m.text}</p>
                {m.match && (
                  <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-surface-dark">
                    <p className="text-sm font-semibold text-ink dark:text-ink-dark">
                      {m.match.label}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {m.match.reason}
                    </p>
                    {m.match.status === "ready" ? (
                      <Link
                        href={m.match.path}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover"
                      >
                        {t("openTool")} →
                      </Link>
                    ) : (
                      <p className="mt-3 inline-block rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                        {t("comingSoon")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(draft);
        }}
        className="mt-3 flex items-center gap-2"
      >
        <input
          className="input flex-1"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t("placeholder")}
          aria-label={t("placeholder")}
        />
        <button type="submit" className="btn-primary px-6 py-3 text-base" disabled={!draft.trim()}>
          {/* Up arrow icon */}
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
          <span className="sr-only">{tCommon("processing")}</span>
        </button>
      </form>
    </div>
  );
}
