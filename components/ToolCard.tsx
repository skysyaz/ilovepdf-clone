import Link from "next/link";
import type { ReactNode } from "react";

export interface ToolCardProps {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  accent?: string;
  badge?: string;
}

export default function ToolCard({
  href,
  title,
  description,
  icon,
  accent = "bg-brand/10 text-brand",
  badge,
}: ToolCardProps) {
  return (
    <Link
      href={href}
      className="group card relative flex flex-col items-start gap-4 p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      {badge && (
        <span
          className="absolute right-4 top-4 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800"
          title="This tool needs native binaries; it returns a clear error on serverless hosts — run locally to use it."
        >
          {badge}
        </span>
      )}
      <span
        className={`grid h-12 w-12 place-items-center rounded-2xl ${accent}`}
        aria-hidden
      >
        {icon}
      </span>
      <div>
        <h3 className="text-lg font-semibold text-ink group-hover:text-brand">
          {title}
        </h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <span className="mt-auto text-sm font-medium text-brand opacity-0 transition group-hover:opacity-100">
        Open tool →
      </span>
    </Link>
  );
}
