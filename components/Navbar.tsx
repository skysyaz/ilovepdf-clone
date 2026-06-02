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
        <nav className="hidden items-center gap-5 text-sm font-medium text-gray-600 lg:flex">
          <Link href="/merge" className="hover:text-brand">
            Merge
          </Link>
          <Link href="/split" className="hover:text-brand">
            Split
          </Link>
          <Link href="/compress" className="hover:text-brand">
            Compress
          </Link>
          <Link href="/rotate" className="hover:text-brand">
            Rotate
          </Link>
          <Link href="/jpg-to-pdf" className="hover:text-brand">
            JPG&nbsp;→&nbsp;PDF
          </Link>
          <Link href="/pdf-to-jpg" className="hover:text-brand">
            PDF&nbsp;→&nbsp;JPG
          </Link>
          <Link href="/watermark" className="hover:text-brand">
            Watermark
          </Link>
          <Link href="/protect" className="hover:text-brand">
            Protect
          </Link>
          <Link href="/unlock" className="hover:text-brand">
            Unlock
          </Link>
          <Link href="/organize" className="hover:text-brand">
            Organize
          </Link>
        </nav>
      </div>
    </header>
  );
}
