import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-lg font-bold text-white shadow-cta">
            ♥
          </span>
          <span className="text-lg font-semibold tracking-tight">
            <span className="text-brand">iLove</span>
            <span className="text-ink">PDF</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
          <Link href="/" className="hover:text-brand">
            All tools
          </Link>
          <Link href="/merge" className="hover:text-brand">
            Merge
          </Link>
          <Link href="/split" className="hover:text-brand">
            Split
          </Link>
          <Link href="/compress" className="hover:text-brand">
            Compress
          </Link>
          <Link
            href="/protect"
            className="rounded-lg bg-brand/10 px-3 py-1.5 text-brand hover:bg-brand/15"
          >
            Protect PDF
          </Link>
        </nav>
      </div>
    </header>
  );
}
