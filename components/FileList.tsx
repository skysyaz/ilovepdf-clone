"use client";

import { formatBytes } from "@/lib/utils";

export interface FileListProps {
  files: File[];
  onRemove?: (index: number) => void;
  onReorder?: (from: number, to: number) => void;
  showOrder?: boolean;
}

export default function FileList({
  files,
  onRemove,
  onReorder,
  showOrder = false,
}: FileListProps) {
  if (!files.length) {
    return (
      <p className="rounded-xl bg-white/20 px-4 py-3 text-xs text-gray-500 dark:bg-white/5">
        No files uploaded yet.
      </p>
    );
  }
  return (
    <ul className="space-y-1.5">
      {files.map((f, i) => (
        <li
          key={`${f.name}-${i}`}
          className="glass-soft flex items-center justify-between gap-3 rounded-xl px-3 py-2"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            {showOrder && (
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand/10 text-xs font-semibold text-brand">
                {i + 1}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-ink dark:text-ink-dark">{f.name}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">{formatBytes(f.size)}</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            {showOrder && onReorder && i > 0 && (
              <button
                type="button"
                onClick={() => onReorder(i, i - 1)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/40 hover:text-ink dark:hover:bg-white/10"
                aria-label="Move up"
              >
                ↑
              </button>
            )}
            {showOrder && onReorder && i < files.length - 1 && (
              <button
                type="button"
                onClick={() => onReorder(i, i + 1)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/40 hover:text-ink dark:hover:bg-white/10"
                aria-label="Move down"
              >
                ↓
              </button>
            )}
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                aria-label="Remove"
              >
                ✕
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}