"use client";

import { useEffect, useRef, useState } from "react";
import FileDropzone from "@/components/FileDropzone";
import PageThumbnailGrid, { type PageItem } from "@/components/PageThumbnailGrid";
import ProcessButton from "@/components/ProcessButton";
import DownloadButton from "@/components/DownloadButton";
import { loadPdfjs } from "@/lib/pdfjs";

export default function OrganizePage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [orderText, setOrderText] = useState("");
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);

  useEffect(() => {
    if (!file) {
      setPages([]);
      setOrderText("");
      return;
    }
    let cancelled = false;
    setRendering(true);
    setError(null);
    (async () => {
      try {
        const pdfjs = await loadPdfjs();
        const buffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
        const pdf = await loadingTask.promise;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D context unavailable in this browser.");
        const items: PageItem[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) break;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.5 });
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          // @ts-ignore
          const task: any = page.render({ canvasContext: ctx, viewport });
          renderTaskRef.current = task;
          await task.promise;
          if (cancelled) break;
          items.push({ id: `p${i}`, pageNumber: i, thumbnail: canvas.toDataURL("image/png") });
        }
        if (!cancelled) {
          setPages(items);
          setOrderText(items.map((p) => p.pageNumber).join(","));
        }
        await pdf.cleanup();
        // @ts-ignore
        await pdf.destroy?.();
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to render pages");
      } finally {
        if (!cancelled) setRendering(false);
        renderTaskRef.current = null;
      }
    })();
    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [file]);

  function handleReorder(next: PageItem[]) {
    setPages(next);
    setOrderText(next.map((p) => p.pageNumber).join(","));
  }

  return (
    <div className="app-scroll">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="animate-flip-in mb-5 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-ink-dark sm:text-3xl">Organize PDF</h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            Drag pages to reorder, or type the desired order below. Click Organize to download a new PDF.
          </p>
        </header>

        <div className="space-y-4">
          <div className="card animate-rise p-4">
            <FileDropzone
              accept={{ "application/pdf": [".pdf"] }}
              onFiles={(fs) => {
                setFile(fs[0] || null);
                setResult(null);
                setError(null);
              }}
              hint="Upload one PDF. We'll render thumbnails for every page."
            />
          </div>

          {rendering && (
            <p className="rounded-lg bg-blue-500/10 px-4 py-2 text-sm text-blue-700 dark:text-blue-300">
              Rendering page thumbnails…
            </p>
          )}

          {pages.length > 0 && (
            <>
              <div className="card animate-rise p-4">
                <h2 className="mb-3 text-xs font-semibold text-ink dark:text-ink-dark">Page order (drag to reorder)</h2>
                <PageThumbnailGrid pages={pages} onChange={handleReorder} />
              </div>
              <div className="card animate-rise flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <h2 className="mb-2 text-xs font-semibold text-ink dark:text-ink-dark">
                    Or type a custom order <span className="font-normal text-gray-500">(overrides drag)</span>
                  </h2>
                  <input className="input" value={orderText} onChange={(e) => setOrderText(e.target.value)} placeholder="1,3,2,4 or 1-3,5,7-9" />
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    Comma-separated. Ranges like <span className="kbd">1-3</span> allowed.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <ProcessButton
                    endpoint="/api/organize"
                    files={file ? [file] : []}
                    fields={{ pageOrder: orderText }}
                    label="Organize PDF"
                    onResult={(blob, filename) => { setResult({ blob, filename }); setError(null); }}
                    onError={(msg) => { setResult(null); setError(msg); }}
                  />
                  {error && <p className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-700 dark:text-red-300">{error}</p>}
                </div>
              </div>
              {result && (
                <div className="card flex flex-col items-center gap-2 p-4 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Your reordered PDF is ready.</p>
                  <DownloadButton blob={result.blob} filename={result.filename} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}