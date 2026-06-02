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
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-gray-600">
          {description}
        </p>
      </header>

      <div className="space-y-6">
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
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">
                Selected files ({files.length})
              </h2>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-gray-500 hover:text-brand"
              >
                Clear all
              </button>
            </div>
            <FileList
              files={files}
              onRemove={
                multiple
                  ? (i) => setFiles(files.filter((_, idx) => idx !== i))
                  : () => setFiles([])
              }
            />
          </div>
        )}

        {options && (
          <div className="card p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink">Options</h2>
            {options}
          </div>
        )}

        <div className="flex flex-col items-center gap-3">
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
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        {result && (
          <div className="card flex flex-col items-center gap-3 p-6 text-center">
            <p className="text-sm text-gray-500">Your file is ready.</p>
            <DownloadButton blob={result.blob} filename={result.filename} />
          </div>
        )}
      </div>
    </div>
  );
}
