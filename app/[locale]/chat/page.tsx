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
    <div className="app-scroll">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <header className="animate-flip-in mb-5 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-ink-dark sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600 dark:text-gray-400">
            {t("subtitle")}
          </p>
        </header>

        <div className="card animate-rise flex max-h-[55vh] flex-col p-3">
          <ChatPanel variant="page" />
        </div>

        <section className="mt-6">
          <h2 className="mb-2 text-xs font-semibold text-ink dark:text-ink-dark">What I can do today</h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ready.map((i) => (
              <li key={i.id} className="glass-soft rounded-xl p-3 text-sm">
                <p className="font-medium text-ink dark:text-ink-dark">{i.label}</p>
                <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">{i.reason}</p>
              </li>
            ))}
          </ul>

          <h2 className="mb-2 mt-6 text-xs font-semibold text-ink dark:text-ink-dark">On the roadmap</h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {coming.map((i) => (
              <li key={i.id} className="rounded-xl border border-amber-200/40 bg-amber-500/10 p-3 text-sm dark:border-amber-700/30">
                <p className="font-medium text-ink dark:text-ink-dark">{i.label}</p>
                <p className="mt-0.5 text-[11px] text-amber-800 dark:text-amber-200">{i.reason}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}