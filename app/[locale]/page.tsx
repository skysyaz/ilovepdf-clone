import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ToolCard from "@/components/ToolCard";
import type { ReactNode } from "react";

interface Tool {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  accent?: string;
  badge?: string;
}

const tools: Tool[] = [
  {
    href: "/merge",
    title: "Merge PDF",
    description: "Combine PDFs in the order you want with the easiest PDF merger available.",
    icon: <img src="/icon-merge.svg" alt="" className="h-7 w-7" />,
  },
  {
    href: "/split",
    title: "Split PDF",
    description: "Separate one page or a whole set for easy conversion into independent PDF files.",
    icon: <img src="/icon-split.svg" alt="" className="h-7 w-7" />,
  },
  {
    href: "/compress",
    title: "Compress PDF",
    description: "Reduce file size while optimizing for maximal PDF quality.",
    icon: <img src="/icon-compress.svg" alt="" className="h-7 w-7" />,
  },
  {
    href: "/rotate",
    title: "Rotate PDF",
    description: "Rotate your PDFs the way you need them — by 90, 180 or 270 degrees.",
    icon: <img src="/icon-rotate.svg" alt="" className="h-7 w-7" />,
  },
  {
    href: "/jpg-to-pdf",
    title: "JPG to PDF",
    description: "Convert JPG images to PDF in seconds. Easily adjust orientation and margins.",
    icon: <img src="/icon-jpg-to-pdf.svg" alt="" className="h-7 w-7" />,
  },
  {
    href: "/pdf-to-jpg",
    title: "PDF to JPG",
    description: "Convert every page of your PDF into a high-quality JPG image. Renders in your browser — file never leaves your device.",
    icon: <img src="/icon-pdf-to-jpg.svg" alt="" className="h-7 w-7" />,
    badge: "In your browser",
  },
  {
    href: "/watermark",
    title: "Watermark PDF",
    description: "Stamp an image or text over your PDF in seconds — choose typography, transparency and rotation.",
    icon: <img src="/icon-watermark.svg" alt="" className="h-7 w-7" />,
  },
  {
    href: "/protect",
    title: "Protect PDF",
    description: "Protect PDF files with a password. Encrypt PDF documents to prevent unauthorized access.",
    icon: <img src="/icon-protect.svg" alt="" className="h-7 w-7" />,
    accent: "bg-blue-50 text-blue-600",
  },
  {
    href: "/unlock",
    title: "Unlock PDF",
    description: "Remove PDF password security, giving you the freedom to use your PDFs.",
    icon: <img src="/icon-unlock.svg" alt="" className="h-7 w-7" />,
    accent: "bg-amber-50 text-amber-600",
  },
  {
    href: "/organize",
    title: "Organize PDF",
    description: "Sort pages of your PDF file however you like. Delete PDF pages or add PDF pages.",
    icon: <img src="/icon-organize.svg" alt="" className="h-7 w-7" />,
  },
  {
    href: "/flatten",
    title: "Flatten PDF Form",
    description: "Bake every form field into static page content. Locks the form so it can no longer be filled in.",
    icon: (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    ),
    accent: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  {
    href: "/extract-text",
    title: "Extract Text",
    description: "Pull every word out of your PDF and download it as a .txt file. Runs entirely in your browser.",
    icon: (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="15" y2="17" />
      </svg>
    ),
    accent: "bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300",
    badge: "In your browser",
  },
  {
    href: "/chat",
    title: "Chat with your PDF",
    description: "Tell me what you want to do in plain English — “merge these 3 files”, “add a Confidential watermark”, “extract the text”.",
    icon: (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    accent: "bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300",
    badge: "New",
  },
];

export default async function HomePage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations("home");
  const tApp = await getTranslations("app");
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-ink dark:text-ink-dark sm:text-5xl">
          {t("hero.titleStart")}
          <span className="text-brand">{t("hero.titleHighlight")}</span>
          {t("hero.titleEnd")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          {t("hero.subtitle")}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500">
          <span className="rounded-full bg-white px-3 py-1 shadow-card">100% free</span>
          <span className="rounded-full bg-white px-3 py-1 shadow-card">No signup</span>
          <span className="rounded-full bg-white px-3 py-1 shadow-card">Files processed in-memory</span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <ToolCard
            key={t.href}
            href={t.href}
            title={t.title}
            description={t.description}
            icon={t.icon}
            accent={t.accent}
            badge={t.badge}
          />
        ))}
      </section>

      <section className="mt-16">
        <div className="card grid gap-6 p-6 sm:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold text-ink">How it works</h3>
            <p className="mt-2 text-sm text-gray-600">
              Pick a tool above, drop in your files, and we&apos;ll process them
              in seconds.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">Built for speed</h3>
            <p className="mt-2 text-sm text-gray-600">
              Most tools run on a Cloudflare Worker using pdf-lib and pure-JS
              Web Crypto for encryption. PDF to JPG and Organize thumbnails
              render directly in your browser via pdf.js.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">Privacy first</h3>
            <p className="mt-2 text-sm text-gray-600">
              Files are streamed into memory, processed, and immediately
              returned. Nothing is written to disk or stored.
            </p>
          </div>
        </div>
      </section>


    </div>
  );
}
