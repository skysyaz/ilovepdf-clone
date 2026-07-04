"use client";

import { useCallback, useState } from "react";
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

  return (
    <div>
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
          isDragActive
            ? "border-brand bg-brand/5"
            : "border-white/20 bg-white/20 hover:border-brand/60 dark:border-white/10 dark:bg-white/5"
        }`}
      >
        <input {...getInputProps()} />
        <div
          aria-hidden
          className="mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand transition-transform duration-300"
          style={{ transform: isDragActive ? "scale(1.1) translateY(-2px)" : "none" }}
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <p className="text-sm font-medium text-ink dark:text-ink-dark">{label}</p>
        {hint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
        <button
          type="button"
          onClick={open}
          className="mt-3 rounded-xl border border-brand/30 bg-white/40 px-4 py-1.5 text-xs font-medium text-brand transition hover:bg-brand/10 dark:bg-white/5"
        >
          Select files
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}