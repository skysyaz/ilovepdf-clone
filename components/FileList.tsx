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
      <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
        No files uploaded yet.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {files.map((f, i) => (
        <li
          key={`${f.name}-${i}`}
          className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {showOrder && (
              <span className="grid h-6 w-6 place-items-center rounded-full bg-brand/10 text-xs font-semibold text-brand">
                {i + 1}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{f.name}</p>
              <p className="text-xs text-gray-500">{formatBytes(f.size)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {showOrder && onReorder && i > 0 && (
              <button
                type="button"
                onClick={() => onReorder(i, i - 1)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-ink"
                aria-label="Move up"
              >
                ↑
              </button>
            )}
            {showOrder && onReorder && i < files.length - 1 && (
              <button
                type="button"
                onClick={() => onReorder(i, i + 1)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-ink"
                aria-label="Move down"
              >
                ↓
              </button>
            )}
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
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
