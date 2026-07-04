import { Link } from "@/i18n/navigation";

export const metadata = {
  title: "Offline — iLovePDF Clone",
};

export default function OfflinePage() {
  return (
    <div className="app-scroll">
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-brand/10 text-brand">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-ink dark:text-ink-dark">You&apos;re offline</h1>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          We couldn&apos;t reach the network and we don&apos;t have this page cached. The good news:
          PDF to JPG and Organize render entirely in your browser, so those still work without a connection.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn-primary">Go home</Link>
          <Link href="/pdf-to-jpg" className="btn-ghost">Open PDF to JPG (works offline)</Link>
        </div>
      </div>
    </div>
  );
}