"use client";

import { useState, type ReactNode } from "react";
import FileDropzone from "@/components/FileDropzone";
import FileList from "@/components/FileList";
import ProcessButton from "@/components/ProcessButton";
import DownloadButton from "@/components/DownloadButton";

export interface ToolShellProps {
  title: string;
  description: string;
  endpoint: string;
  multiple?: boolean;
  accept?: Record<string, string[]>;
  options: ReactNode; // tool-specific form fields
  buildFields: () => Record<string, string>;
  processLabel: string;
  requiresFields?: boolean; // disable process button until options are valid
  hint?: string;
  dropzoneLabel?: string;
}

export default function ToolShell({
  title,
  description,
  endpoint,
  multiple = false,
  accept,
  options,
  buildFields,
  processLabel,
  requiresFields = false,
  hint,
  dropzoneLabel,
}: ToolShellProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  function clearAll() {
    setFiles([]);
    setResult(null);
    setError(null);
  }

  return (
    <div className="app-scroll">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <header className="animate-flip-in mb-5 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-ink-dark sm:text-3xl">
            {title}
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Left: dropzone + file list */}
          <div className="card animate-rise space-y-3 p-4">
            <FileDropzone
              accept={accept}
              multiple={multiple}
              onFiles={(fs) => {
                setFiles(multiple ? [...files, ...fs] : [fs[0]]);
                setResult(null);
                setError(null);
              }}
              hint={hint}
              label={dropzoneLabel}
            />
            {files.length > 0 && (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-ink dark:text-ink-dark">
                    Selected ({files.length})
                  </h2>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-[11px] text-gray-500 hover:text-brand"
                  >
                    Clear all
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto pr-1">
                  <FileList
                    files={files}
                    onRemove={
                      multiple
                        ? (i) => setFiles(files.filter((_, idx) => idx !== i))
                        : () => setFiles([])
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right: options + action + result */}
          <div className="card animate-rise flex flex-col gap-3 p-4">
            {options && (
              <div>
                <h2 className="mb-2 text-xs font-semibold text-ink dark:text-ink-dark">
                  Options
                </h2>
                {options}
              </div>
            )}
            <div className="flex flex-col items-center gap-2">
              <ProcessButton
                endpoint={endpoint}
                files={files}
                fields={buildFields()}
                label={processLabel}
                disabled={requiresFields}
                onResult={(blob, filename) => {
                  setResult({ blob, filename });
                  setError(null);
                }}
                onError={(msg) => {
                  setResult(null);
                  setError(msg);
                }}
              />
              {error && (
                <p className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-700 dark:text-red-300">
                  {error}
                </p>
              )}
            </div>
            {result && (
              <div className="mt-1 flex flex-col items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-center">
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Your file is ready.
                </p>
                <DownloadButton blob={result.blob} filename={result.filename} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}