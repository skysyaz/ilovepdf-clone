"use client";

import { useCallback, useState, type DragEvent } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";

export interface FileDropzoneProps {
  accept?: Record<string, string[]>;
  multiple?: boolean;
  maxSize?: number; // bytes
  onFiles: (files: File[]) => void;
  hint?: string;
  label?: string;
}

export default function FileDropzone({
  accept,
  multiple = false,
  maxSize = 100 * 1024 * 1024, // 100 MB
  onFiles,
  hint,
  label = "Drag & drop files here, or click to browse",
}: FileDropzoneProps) {
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      if (rejections.length) {
        const reasons = rejections[0].errors.map((e) => e.message).join("; ");
        setError(reasons);
        return;
      }
      setError(null);
      if (accepted.length) onFiles(accepted);
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: handleDrop,
    accept,
    multiple,
    maxSize,
    noClick: true,
    noKeyboard: true,
  });

  // Allow keyboard activation through a focusable wrapper.
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  };

  // Suppress unused DragEvent import (kept for future drag-preview custom code).
  void (null as unknown as DragEvent<HTMLDivElement>);

  return (
    <div>
      <div
        {...getRootProps()}
        role="button"
        tabIndex={0}
        onKeyDown={onKeyDown}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white px-6 py-12 text-center transition focus:outline-none focus:ring-2 focus:ring-brand/30 ${
          isDragActive
            ? "border-brand bg-brand/5"
            : "border-gray-300 hover:border-brand/60"
        }`}
      >
        <input {...getInputProps()} />
        <svg
          aria-hidden
          className="mb-3 h-10 w-10 text-brand"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        <p className="text-base font-medium text-ink">{label}</p>
        {hint && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
        <button
          type="button"
          onClick={open}
          className="mt-4 rounded-xl border border-brand/30 bg-white px-4 py-2 text-sm font-medium text-brand hover:bg-brand/5"
        >
          Select files
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
