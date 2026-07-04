"use client";

import { Link } from "@/i18n/navigation";
import { useRef, type ReactNode } from "react";

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
  const ref = useRef<HTMLAnchorElement>(null);

  function onMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform =
      `perspective(900px) rotateX(${(-py * 9).toFixed(2)}deg) rotateY(${(px * 12).toFixed(2)}deg) translateZ(6px)`;
  }
  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateX(0) rotateY(0) translateZ(0)";
  }

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="card group relative flex flex-col items-start gap-3 overflow-hidden p-5 transition-[transform,box-shadow] duration-300 ease-out will-change-transform"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* accent glow that bleeds in on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "var(--accent-glow)" }}
      />
      {badge && (
        <span className="absolute right-3 top-3 rounded-full bg-amber-100/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 backdrop-blur">
          {badge}
        </span>
      )}
      <span
        className="grid h-11 w-11 place-items-center rounded-2xl text-brand shadow-[0_8px_20px_-10px] shadow-brand/40"
        style={{ background: "color-mix(in oklab, var(--accent) 12%, transparent)", transform: "translateZ(30px)" }}
        aria-hidden
      >
        {icon}
      </span>
      <div style={{ transform: "translateZ(24px)" }}>
        <h3 className="text-[15px] font-semibold text-ink group-hover:text-brand dark:text-ink-dark">
          {title}
        </h3>
        <p className="mt-1 text-[13px] leading-snug text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
      <span
        className="mt-auto text-[13px] font-medium text-brand opacity-0 transition-all duration-300 group-hover:opacity-100"
        style={{ transform: "translateZ(30px)" }}
      >
        Open tool →
      </span>
    </Link>
  );
}