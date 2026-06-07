"use client";

import { useRef, useState } from "react";
import FileDropzone from "@/components/FileDropzone";
import FileList from "@/components/FileList";
import DownloadButton from "@/components/DownloadButton";
import JSZip from "jszip";

// Render scale: 2.0 ≈ 144 DPI, a good default for a sharp on-screen image.
const RENDER_SCALE = 2.0;

export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(85);
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null
  );
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Hold a handle on the in-flight pdf.js render task so the user can cancel.
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  // Hold a handle on the in-flight getDocument so the user can cancel during load.
  const loadTaskRef = useRef<{ destroy: () => void } | null>(null);
  const cancelledRef = useRef(false);

  function clearAll() {
    cancelledRef.current = true;
    renderTaskRef.current?.cancel();
    loadTaskRef.current?.destroy();
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(null);
    setRendering(false);
  }

  function handleConvert() {
    if (!file) return;
    cancelledRef.current = false;
    setRendering(true);
    setError(null);
    setResult(null);
    setProgress({ done: 0, total: 0 });

    (async () => {
      try {
        // Lazy-load pdf.js. We point GlobalWorkerOptions.workerSrc at a
        // pinned CDN copy of the worker that exactly matches our installed
        // pdfjs-dist version. The earlier `?url` dynamic-import trick (used
        // in app/organize/page.tsx) compiles to a chunked Webpack require
        // that pdf.js rejects with "Invalid `workerSrc` type." at runtime.
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc =
          "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.0.227/build/pdf.worker.min.mjs";

        const buffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({
          data: new Uint8Array(buffer),
        });
        // @ts-ignore — pdfjs types vary by version
        loadTaskRef.current = loadingTask;

        const pdf = await loadingTask.promise;
        const pageCount = pdf.numPages;
        setProgress({ done: 0, total: pageCount });

        const zip = new JSZip();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D context unavailable in this browser.");

        for (let i = 1; i <= pageCount; i++) {
          if (cancelledRef.current) break;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: RENDER_SCALE });
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          // White background — PDF pages are transparent by default and a
          // transparent canvas would render as black on most viewers.
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // @ts-ignore — pdfjs types vary by version
          const task: any = page.render({ canvasContext: ctx, viewport });
          renderTaskRef.current = task;
          await task.promise;
          renderTaskRef.current = null;

          if (cancelledRef.current) break;

          const blob: Blob | null = await new Promise((resolve) =>
            canvas.toBlob((b) => resolve(b), "image/jpeg", quality / 100)
          );
          if (!blob) throw new Error(`Failed to encode page ${i} as JPEG.`);
          const arrayBuffer = await blob.arrayBuffer();
          zip.file(
            `page-${String(i).padStart(3, "0")}.jpg`,
            new Uint8Array(arrayBuffer)
          );
          setProgress({ done: i, total: pageCount });
          // Release the page object — keeps memory bounded for big PDFs.
          // @ts-ignore
          page.cleanup?.();
        }

        // Best-effort cleanup. The destroy() method only exists in newer
        // pdf.js builds; if it's not there, just skip it.
        try {
          // @ts-ignore
          await pdf.cleanup?.();
          // @ts-ignore
          await pdf.destroy?.();
        } catch {
          /* ignore */
        }
        loadTaskRef.current = null;

        if (cancelledRef.current) {
          setRendering(false);
          setProgress(null);
          return;
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const baseName = file.name.replace(/\.pdf$/i, "") || "pdf";
        setResult({ blob: zipBlob, filename: `${baseName}-pages.zip` });
        setRendering(false);
      } catch (e) {
        if (cancelledRef.current) return;
        setError(e instanceof Error ? e.message : "PDF→JPG failed.");
        setRendering(false);
        setProgress(null);
      }
    })();
  }

  const convertDisabled = !file || rendering;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          PDF to JPG
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-gray-600">
          Render every page of your PDF as a high-quality JPG image. Conversion
          runs in your browser — your file never leaves your device.
        </p>
      </header>

      <div className="space-y-6">
        <FileDropzone
          accept={{ "application/pdf": [".pdf"] }}
          multiple={false}
          onFiles={(fs) => {
            setFile(fs[0] || null);
            setResult(null);
            setError(null);
            setProgress(null);
          }}
          hint="Upload one PDF. Renders locally in your browser."
        />

        {file && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">Selected file</h2>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-gray-500 hover:text-brand"
                disabled={rendering}
              >
                Clear
              </button>
            </div>
            <FileList files={[file]} onRemove={() => clearAll()} />
          </div>
        )}

        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink">Options</h2>
          <div>
            <label className="label" htmlFor="quality">
              JPEG quality ({quality}%)
            </label>
            <input
              id="quality"
              type="range"
              min={30}
              max={100}
              step={5}
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value, 10))}
              disabled={rendering}
              className="w-full accent-brand"
            />
            <p className="text-xs text-gray-500">
              Lower quality → smaller file size. 85 is a good default.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          {rendering && progress ? (
            <div className="w-full max-w-md">
              <div className="mb-1 flex items-center justify-between text-sm text-gray-600">
                <span>
                  Rendering page {progress.done} of {progress.total}…
                </span>
                <button
                  type="button"
                  onClick={() => {
                    cancelledRef.current = true;
                    renderTaskRef.current?.cancel();
                    loadTaskRef.current?.destroy();
                  }}
                  className="text-xs text-gray-500 hover:text-red-600"
                >
                  Cancel
                </button>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
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
              onClick={handleConvert}
              disabled={convertDisabled}
              className="btn-primary"
            >
              Convert to JPG
            </button>
          )}
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        {result && (
          <div className="card flex flex-col items-center gap-3 p-6 text-center">
            <p className="text-sm text-gray-500">Your zip of JPG pages is ready.</p>
            <DownloadButton blob={result.blob} filename={result.filename} />
          </div>
        )}
      </div>
    </div>
  );
}
