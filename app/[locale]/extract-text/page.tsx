"use client";

import { useRef, useState } from "react";
import FileDropzone from "@/components/FileDropzone";
import FileList from "@/components/FileList";
import DownloadButton from "@/components/DownloadButton";
import { loadPdfjs } from "@/lib/pdfjs";

interface ExtractedPage {
  pageNumber: number;
  text: string;
}

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
      const pdfjs = await loadPdfjs();
      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;
      const pageCount = pdf.numPages;
      setProgress({ done: 0, total: pageCount });

      const out: ExtractedPage[] = [];
      for (let i = 1; i <= pageCount; i++) {
        if (cancelledRef.current) break;
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const lineMap = new Map<number, string[]>();
        for (const item of content.items as Array<{ str: string; transform: number[]; hasEOL?: boolean }>) {
          if (!item.str) continue;
          const y = Math.round(item.transform[5]);
          const arr = lineMap.get(y) ?? [];
          arr.push(item.str);
          lineMap.set(y, arr);
        }
        const lines = Array.from(lineMap.entries())
          .sort((a, b) => b[0] - a[0])
          .map(([, parts]) => parts.join(" ").replace(/\s+/g, " ").trim())
          .filter((l) => l.length > 0);
        out.push({ pageNumber: i, text: lines.join("\n") });
        setProgress({ done: i, total: pageCount });
        // @ts-ignore
        page.cleanup?.();
      }
      try {
        // @ts-ignore
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
    <div className="app-scroll">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <header className="animate-flip-in mb-5 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-ink-dark sm:text-3xl">Extract Text from PDF</h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            Pull every word out of your PDF and download it as a .txt file. Runs entirely in your browser.
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card animate-rise space-y-3 p-4">
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
                <div className="mb-1.5 flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-ink dark:text-ink-dark">Selected file</h2>
                  <button type="button" onClick={clearAll} className="text-[11px] text-gray-500 hover:text-brand" disabled={extracting}>Clear</button>
                </div>
                <FileList files={[file]} onRemove={() => clearAll()} />
              </div>
            )}
          </div>

          <div className="card animate-rise flex flex-col gap-3 p-4">
            <div className="flex flex-col items-center gap-2">
              {extracting && progress ? (
                <div className="w-full max-w-md">
                  <div className="mb-1 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Extracting text from page {progress.done} of {progress.total}…</span>
                    <button type="button" onClick={() => (cancelledRef.current = true)} className="text-gray-500 hover:text-red-600">Cancel</button>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                    <div className="h-full bg-brand transition-all"
                      style={{ width: `${progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0}%` }} />
                  </div>
                </div>
              ) : (
                <button type="button" onClick={handleExtract} disabled={disabled} className="btn-primary">Extract text</button>
              )}
              {error && <p className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-700 dark:text-red-300">{error}</p>}
            </div>

            {fullText !== null && pages && (
              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xs font-semibold text-ink dark:text-ink-dark">
                    Extracted — {pages.length} page{pages.length === 1 ? "" : "s"}, {totalChars.toLocaleString()} chars
                  </h2>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => navigator.clipboard?.writeText(fullText)} className="btn-ghost px-3 py-1.5 text-xs">Copy all</button>
                    <DownloadButton
                      blob={new Blob([fullText], { type: "text/plain;charset=utf-8" })}
                      filename={`${baseName}-text.txt`}
                      label="Download .txt"
                    />
                  </div>
                </div>
                <div className="max-h-[50vh] overflow-y-auto rounded-lg border border-white/10 bg-white/20 p-3 text-[13px] leading-relaxed text-ink dark:bg-white/5 dark:text-ink-dark">
                  {pages.map((p) => (
                    <div key={p.pageNumber} className="mb-4 last:mb-0">
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Page {p.pageNumber}</p>
                      <pre className="whitespace-pre-wrap font-sans">{p.text || "(no text on this page)"}</pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}