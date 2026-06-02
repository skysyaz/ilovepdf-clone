import Link from "next/link";
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
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Every <span className="text-brand">PDF</span> tool you need
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          Merge, split, compress, convert, watermark and protect PDF files.
          Most tools process on our server in-memory and never store anything;
          PDF to JPG and Organize render thumbnails directly in your browser.
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

      <p className="mt-12 text-center text-sm text-gray-500">
        Open source on{" "}
        <a
          href="https://github.com/skysyaz/ilovepdf-clone"
          target="_blank"
          rel="noreferrer noopener"
          className="text-brand hover:underline"
        >
          GitHub
        </a>
        .
      </p>
    </div>
  );
}
