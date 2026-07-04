"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import ThemeToggle from "@/components/ThemeToggle";
import PWAInstall from "@/components/PWAInstall";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations("nav");
  const links: Array<{ href: string; label: string }> = [
    { href: "/merge", label: t("merge") },
    { href: "/split", label: t("split") },
    { href: "/compress", label: t("compress") },
    { href: "/rotate", label: t("rotate") },
    { href: "/jpg-to-pdf", label: t("jpgToPdf") },
    { href: "/pdf-to-jpg", label: t("pdfToJpg") },
    { href: "/watermark", label: t("watermark") },
    { href: "/protect", label: t("protect") },
    { href: "/unlock", label: t("unlock") },
    { href: "/organize", label: t("organize") },
  ];

  return (
    <header className="glass z-30 flex items-center justify-between gap-3 px-4 py-2.5">
      <Link href="/" className="group flex shrink-0 items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-hover text-lg font-bold text-white shadow-[0_8px_20px_-8px] shadow-brand/50 transition group-hover:scale-105">
          ♥
        </span>
        <span className="text-base font-semibold tracking-tight">
          <span className="text-brand">iLove</span>
          <span className="text-ink dark:text-ink-dark">PDF</span>
        </span>
      </Link>

      <nav className="hidden items-center gap-1 xl:flex">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-gray-600 transition hover:bg-white/40 hover:text-brand dark:text-gray-300 dark:hover:bg-white/5"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <PWAInstall />
        <LanguageSwitcher />
        <Link
          href="/chat"
          className="hidden items-center gap-1.5 rounded-xl border border-white/20 bg-white/30 px-3 py-2 text-sm font-medium text-ink transition hover:border-brand hover:text-brand dark:bg-white/5 dark:text-ink-dark sm:inline-flex"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {t("chat")}
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}