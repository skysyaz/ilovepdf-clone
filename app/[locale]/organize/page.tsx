"use client";

import { useEffect, useRef, useState } from "react";
import FileDropzone from "@/components/FileDropzone";
import PageThumbnailGrid, { type PageItem } from "@/components/PageThumbnailGrid";
import ProcessButton from "@/components/ProcessButton";
import DownloadButton from "@/components/DownloadButton";

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

  // Render page thumbnails using pdfjs-dist in the browser.
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
        const pdfjs = await import("pdfjs-dist");
        // Point pdf.js at a pinned CDN copy of the worker that exactly
        // matches our installed pdfjs-dist version. The previous '?url'
        // dynamic-import trick returned the wrong type for workerSrc at
        // runtime ("Invalid `workerSrc` type.").
        pdfjs.GlobalWorkerOptions.workerSrc =
          "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.0.227/build/pdf.worker.min.mjs";

        const buffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
        const pdf = await loadingTask.promise;
        const items: PageItem[] = [];
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) break;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.5 });
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          // Render onto the canvas.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const task: any = (page as any).render({ canvasContext: ctx, viewport });
          renderTaskRef.current = task;
          await task.promise;
          if (cancelled) break;
          items.push({
            id: `p${i}`,
            pageNumber: i,
            thumbnail: canvas.toDataURL("image/png"),
          });
        }
        if (!cancelled) {
          setPages(items);
          setOrderText(items.map((p) => p.pageNumber).join(","));
        }
        await pdf.cleanup();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (pdf as any).destroy?.();
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to render pages");
        }
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
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Organize PDF
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-gray-600">
          Drag pages to reorder, or type the desired page order below. Click
          Organize to download a new PDF.
        </p>
      </header>

      <div className="space-y-6">
        <FileDropzone
          accept={{ "application/pdf": [".pdf"] }}
          onFiles={(fs) => {
            setFile(fs[0] || null);
            setResult(null);
            setError(null);
          }}
          hint="Upload one PDF. We'll render thumbnails for every page."
        />

        {rendering && (
          <p className="rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">
            Rendering page thumbnails…
          </p>
        )}

        {pages.length > 0 && (
          <>
            <div className="card p-5">
              <h2 className="mb-3 text-sm font-semibold text-ink">
                Page order (drag to reorder)
              </h2>
              <PageThumbnailGrid pages={pages} onChange={handleReorder} />
            </div>
            <div className="card p-5">
              <h2 className="mb-3 text-sm font-semibold text-ink">
                Or type the order manually
              </h2>
              <input
                className="input"
                value={orderText}
                onChange={(e) => setOrderText(e.target.value)}
                placeholder="1,3,2,4 or 1-3,5,7-9"
              />
              <p className="mt-2 text-xs text-gray-500">
                Comma-separated list. Ranges like <span className="kbd">1-3</span>{" "}
                are allowed.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <ProcessButton
                endpoint="/api/organize"
                files={file ? [file] : []}
                fields={{ pageOrder: orderText }}
                label="Organize PDF"
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
                <p className="text-sm text-gray-500">Your reordered PDF is ready.</p>
                <DownloadButton blob={result.blob} filename={result.filename} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
