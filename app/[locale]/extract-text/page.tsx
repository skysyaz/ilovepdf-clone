"use client";

import { useRef, useState } from "react";
import FileDropzone from "@/components/FileDropzone";
import FileList from "@/components/FileList";
import DownloadButton from "@/components/DownloadButton";

interface ExtractedPage {
  pageNumber: number;
  text: string;
}

/**
 * Extract text from a PDF entirely in the browser. Mirrors the
 * pdf-to-jpg pattern: pdf.js for parsing, then we hand the text
 * back to the user as a single .txt file. No server roundtrip.
 */
export default function ExtractTextPage() {
  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [pages, setPages] = useState<ExtractedPage[] | null>(null);
  const [fullText, setFullText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  function clearAll() {
    cancelledRef.current = true;
    setFile(null);
    setPages(null);
    setFullText(null);
    setError(null);
    setProgress(null);
    setExtracting(false);
  }

  async function handleExtract() {
    if (!file) return;
    cancelledRef.current = false;
    setExtracting(true);
    setError(null);
    setPages(null);
    setFullText(null);
    setProgress({ done: 0, total: 0 });

    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc =
        "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.0.227/build/pdf.worker.min.mjs";

      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(buffer),
      });
      const pdf = await loadingTask.promise;
      const pageCount = pdf.numPages;
      setProgress({ done: 0, total: pageCount });

      const out: ExtractedPage[] = [];
      for (let i = 1; i <= pageCount; i++) {
        if (cancelledRef.current) break;
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        // Each "item" in the text content is a TextItem with a `.str`
        // string and optional transform. We reconstruct a single line per
        // row by joining items that share a baseline.
        const lineMap = new Map<number, string[]>();
        for (const item of content.items as Array<{
          str: string;
          transform: number[];
          hasEOL?: boolean;
        }>) {
          if (!item.str) continue;
          // transform[5] is the y baseline. Round to int to group rows.
          const y = Math.round(item.transform[5]);
          const arr = lineMap.get(y) ?? [];
          arr.push(item.str);
          lineMap.set(y, arr);
        }
        const lines = Array.from(lineMap.entries())
          .sort((a, b) => b[0] - a[0]) // top to bottom
          .map(([, parts]) => parts.join(" ").replace(/\s+/g, " ").trim())
          .filter((l) => l.length > 0);
        out.push({ pageNumber: i, text: lines.join("\n") });
        setProgress({ done: i, total: pageCount });
        page.cleanup?.();
      }
      try {
        // @ts-ignore — destroy() exists in newer pdf.js builds; ignore if missing.
        await pdf.cleanup?.();
        // @ts-ignore
        await pdf.destroy?.();
      } catch {
        /* ignore */
      }

      if (cancelledRef.current) {
        setExtracting(false);
        setProgress(null);
        return;
      }

      setPages(out);
      setFullText(out.map((p) => `--- Page ${p.pageNumber} ---\n${p.text}`).join("\n\n"));
      setExtracting(false);
    } catch (e) {
      if (cancelledRef.current) return;
      setError(e instanceof Error ? e.message : "Text extraction failed.");
      setExtracting(false);
      setProgress(null);
    }
  }

  const disabled = !file || extracting;
  const totalChars = fullText?.length ?? 0;
  const baseName = file?.name.replace(/\.pdf$/i, "") || "pdf";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-ink dark:text-ink-dark sm:text-4xl">
          Extract Text from PDF
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-gray-600 dark:text-gray-400">
          Pull every word out of your PDF and download it as a plain .txt
          file. Runs entirely in your browser — your file never leaves the
          device.
        </p>
      </header>

      <div className="space-y-6">
        <FileDropzone
          accept={{ "application/pdf": [".pdf"] }}
          multiple={false}
          onFiles={(fs) => {
            setFile(fs[0] || null);
            setPages(null);
            setFullText(null);
            setError(null);
            setProgress(null);
          }}
          hint="Upload one PDF. Text is extracted locally in your browser."
        />

        {file && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink dark:text-ink-dark">
                Selected file
              </h2>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-gray-500 hover:text-brand"
                disabled={extracting}
              >
                Clear
              </button>
            </div>
            <FileList files={[file]} onRemove={() => clearAll()} />
          </div>
        )}

        <div className="flex flex-col items-center gap-3">
          {extracting && progress ? (
            <div className="w-full max-w-md">
              <div className="mb-1 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>
                  Extracting text from page {progress.done} of {progress.total}…
                </span>
                <button
                  type="button"
                  onClick={() => (cancelledRef.current = true)}
                  className="text-xs text-gray-500 hover:text-red-600"
                >
                  Cancel
                </button>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                <div
                  className="h-full bg-brand transition-all"
                  style={{
                    width: `${
                      progress.total > 0
                        ? Math.round((progress.done / progress.total) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleExtract}
              disabled={disabled}
              className="btn-primary"
            >
              Extract text
            </button>
          )}
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        {fullText !== null && pages && (
          <div className="card p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-ink dark:text-ink-dark">
                Extracted text — {pages.length} page{pages.length === 1 ? "" : "s"},{" "}
                {totalChars.toLocaleString()} characters
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(fullText)}
                  className="btn-ghost"
                >
                  Copy all
                </button>
                <DownloadButton
                  blob={new Blob([fullText], { type: "text/plain;charset=utf-8" })}
                  filename={`${baseName}-text.txt`}
                  label="Download .txt"
                />
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm leading-relaxed text-ink dark:border-gray-800 dark:bg-gray-900 dark:text-ink-dark">
              {pages.map((p) => (
                <div key={p.pageNumber} className="mb-4 last:mb-0">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Page {p.pageNumber}
                  </p>
                  <pre className="whitespace-pre-wrap font-sans">{p.text || "(no text on this page)"}</pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
