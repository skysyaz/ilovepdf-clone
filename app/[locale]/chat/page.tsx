"use client";

import { useTranslations } from "next-intl";
import ChatPanel from "@/components/ChatPanel";
import { listIntents } from "@/lib/intents";

export default function ChatPage() {
  const t = useTranslations("chat");
  const intents = listIntents();
  const ready = intents.filter((i) => i.status === "ready");
  const coming = intents.filter((i) => i.status === "coming-soon");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-ink dark:text-ink-dark sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-gray-600 dark:text-gray-400">
          {t("subtitle")}
        </p>
      </header>

      <div className="card flex max-h-[60vh] flex-col p-4">
        <ChatPanel variant="page" />
      </div>

      <section className="mt-10">
        <h2 className="mb-3 text-sm font-semibold text-ink dark:text-ink-dark">
          What I can do today
        </h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ready.map((i) => (
            <li
              key={i.id}
              className="rounded-xl border border-gray-100 bg-white p-3 text-sm dark:border-gray-800 dark:bg-surface-dark"
            >
              <p className="font-medium text-ink dark:text-ink-dark">{i.label}</p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{i.reason}</p>
            </li>
          ))}
        </ul>

        <h2 className="mb-3 mt-8 text-sm font-semibold text-ink dark:text-ink-dark">
          On the roadmap
        </h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {coming.map((i) => (
            <li
              key={i.id}
              className="rounded-xl border border-amber-100 bg-amber-50/60 p-3 text-sm dark:border-amber-900/30 dark:bg-amber-900/10"
            >
              <p className="font-medium text-ink dark:text-ink-dark">{i.label}</p>
              <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-200">{i.reason}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
