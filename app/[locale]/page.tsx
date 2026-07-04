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
    icon: <img src="/icon-merge.svg" alt="" className="h-6 w-6" />,
  },
  {
    href: "/split",
    title: "Split PDF",
    description: "Separate one page or a whole set for easy conversion into independent PDF files.",
    icon: <img src="/icon-split.svg" alt="" className="h-6 w-6" />,
  },
  {
    href: "/compress",
    title: "Compress PDF",
    description: "Reduce file size while optimizing for maximal PDF quality.",
    icon: <img src="/icon-compress.svg" alt="" className="h-6 w-6" />,
  },
  {
    href: "/rotate",
    title: "Rotate PDF",
    description: "Rotate your PDFs the way you need them — by 90, 180 or 270 degrees.",
    icon: <img src="/icon-rotate.svg" alt="" className="h-6 w-6" />,
  },
  {
    href: "/jpg-to-pdf",
    title: "JPG to PDF",
    description: "Convert JPG or PNG images to PDF in seconds — each image becomes one A4 page.",
    icon: <img src="/icon-jpg-to-pdf.svg" alt="" className="h-6 w-6" />,
  },
  {
    href: "/pdf-to-jpg",
    title: "PDF to JPG",
    description: "Render every page as a high-quality JPG, in your browser — file never leaves your device.",
    icon: <img src="/icon-pdf-to-jpg.svg" alt="" className="h-6 w-6" />,
    badge: "In your browser",
  },
  {
    href: "/watermark",
    title: "Watermark PDF",
    description: "Stamp text over your PDF — choose typography, transparency and rotation.",
    icon: <img src="/icon-watermark.svg" alt="" className="h-6 w-6" />,
  },
  {
    href: "/protect",
    title: "Protect PDF",
    description: "Encrypt PDF documents with an AES-256 password to prevent unauthorized access.",
    icon: <img src="/icon-protect.svg" alt="" className="h-6 w-6" />,
    accent: "bg-blue-50 text-blue-600",
  },
  {
    href: "/unlock",
    title: "Unlock PDF",
    description: "Remove PDF password security, giving you the freedom to use your PDFs.",
    icon: <img src="/icon-unlock.svg" alt="" className="h-6 w-6" />,
    accent: "bg-amber-50 text-amber-600",
  },
  {
    href: "/organize",
    title: "Organize PDF",
    description: "Drag-and-drop reorder pages, delete pages, or specify a new order manually.",
    icon: <img src="/icon-organize.svg" alt="" className="h-6 w-6" />,
  },
  {
    href: "/flatten",
    title: "Flatten PDF Form",
    description: "Bake every form field into static page content. Locks the form so it can't be filled in.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    ),
    accent: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  {
    href: "/extract-text",
    title: "Extract Text",
    description: "Pull every word out of your PDF and download it as a .txt file. Runs in your browser.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
    description: "Tell me what you want in plain English — “merge these 3 files”, “add a Confidential watermark”.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
  return (
    <div className="app-scroll">
      <div className="mx-auto max-w-6xl px-4 py-8 lg:py-10">
        <section className="animate-flip-in mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-ink dark:text-ink-dark sm:text-4xl">
            {t("hero.titleStart")}
            <span className="bg-gradient-to-r from-brand to-brand-hover bg-clip-text text-transparent">
              {t("hero.titleHighlight")}
            </span>
            {t("hero.titleEnd")}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-[15px] text-gray-600 dark:text-gray-400">
            {t("hero.subtitle")}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500">
            {["100% free", "No signup", "Files processed in-memory"].map((b) => (
              <span key={b} className="glass-soft rounded-full px-3 py-1">
                {b}
              </span>
            ))}
          </div>
        </section>

        <section className="stagger grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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

        <section className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { h: "How it works", b: "Pick a tool, drop in your files, and we process them in seconds." },
            { h: "Built for speed", b: "Most tools run on a Cloudflare Worker using pdf-lib and pure-JS Web Crypto. PDF→JPG and Organize render in your browser via pdf.js." },
            { h: "Privacy first", b: "Files are streamed into memory, processed, and returned. Nothing is written to disk or stored." },
          ].map((c) => (
            <div key={c.h} className="glass-soft rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-ink dark:text-ink-dark">{c.h}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600 dark:text-gray-400">{c.b}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}