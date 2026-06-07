"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import ThemeToggle from "@/components/ThemeToggle";
import PWAInstall from "@/components/PWAInstall";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations("nav");
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-surface-dark/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-lg font-bold text-white shadow-cta">
            ♥
          </span>
          <span className="text-lg font-semibold tracking-tight">
            <span className="text-brand">iLove</span>
            <span className="text-ink dark:text-ink-dark">PDF</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-gray-600 dark:text-gray-300 lg:flex">
          <Link href="/merge" className="hover:text-brand">{t("merge")}</Link>
          <Link href="/split" className="hover:text-brand">{t("split")}</Link>
          <Link href="/compress" className="hover:text-brand">{t("compress")}</Link>
          <Link href="/rotate" className="hover:text-brand">{t("rotate")}</Link>
          <Link href="/jpg-to-pdf" className="hover:text-brand">{t("jpgToPdf")}</Link>
          <Link href="/pdf-to-jpg" className="hover:text-brand">{t("pdfToJpg")}</Link>
          <Link href="/watermark" className="hover:text-brand">{t("watermark")}</Link>
          <Link href="/protect" className="hover:text-brand">{t("protect")}</Link>
          <Link href="/unlock" className="hover:text-brand">{t("unlock")}</Link>
          <Link href="/organize" className="hover:text-brand">{t("organize")}</Link>
        </nav>
        <div className="flex items-center gap-2">
          <PWAInstall />
          <LanguageSwitcher />
          <Link
            href="/chat"
            className="hidden items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-ink transition hover:border-brand hover:text-brand dark:border-gray-700 dark:bg-surface-dark dark:text-ink-dark sm:inline-flex"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {t("chat")}
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
