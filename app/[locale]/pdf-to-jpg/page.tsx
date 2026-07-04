"use client";

import { useRef, useState } from "react";
import FileDropzone from "@/components/FileDropzone";
import FileList from "@/components/FileList";
import DownloadButton from "@/components/DownloadButton";
import { loadPdfjs } from "@/lib/pdfjs";
import JSZip from "jszip";

// Render scale: 2.0 ≈ 144 DPI, sharp on screen.
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

  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
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

  function cancelRun() {
    cancelledRef.current = true;
    renderTaskRef.current?.cancel();
    loadTaskRef.current?.destroy();
  }

  async function handleConvert() {
    if (!file) return;
    cancelledRef.current = false;
    setRendering(true);
    setError(null);
    setResult(null);
    setProgress({ done: 0, total: 0 });

    try {
      const pdfjs = await loadPdfjs();
      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
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
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // @ts-ignore
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
        zip.file(`page-${String(i).padStart(3, "0")}.jpg`, new Uint8Array(arrayBuffer));
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
  }

  const convertDisabled = !file || rendering;

  return (
    <div className="app-scroll">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <header className="animate-flip-in mb-5 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-ink-dark sm:text-3xl">
            PDF to JPG
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            Render every page as a high-quality JPG. Conversion runs in your
            browser — your file never leaves your device.
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card animate-rise space-y-3 p-4">
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
                <div className="mb-1.5 flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-ink dark:text-ink-dark">Selected file</h2>
                  <button type="button" onClick={clearAll} className="text-[11px] text-gray-500 hover:text-brand" disabled={rendering}>
                    Clear
                  </button>
                </div>
                <FileList files={[file]} onRemove={() => clearAll()} />
              </div>
            )}
          </div>

          <div className="card animate-rise flex flex-col gap-3 p-4">
            <div>
              <label className="label" htmlFor="quality">JPEG quality ({quality}%)</label>
              <input id="quality" type="range" min={30} max={100} step={5} value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value, 10))} disabled={rendering} className="w-full" />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Lower quality → smaller file. 85 is a good default.</p>
            </div>

            <div className="flex flex-col items-center gap-2">
              {rendering && progress ? (
                <div className="w-full max-w-md">
                  <div className="mb-1 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Rendering page {progress.done} of {progress.total}…</span>
                    <button type="button" onClick={cancelRun} className="text-gray-500 hover:text-red-600">Cancel</button>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                    <div className="h-full bg-brand transition-all"
                      style={{ width: `${progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0}%` }} />
                  </div>
                </div>
              ) : (
                <button type="button" onClick={handleConvert} disabled={convertDisabled} className="btn-primary">
                  Convert to JPG
                </button>
              )}
              {error && <p className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-700 dark:text-red-300">{error}</p>}
            </div>

            {result && (
              <div className="flex flex-col items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-center">
                <p className="text-xs text-emerald-700 dark:text-emerald-300">Your zip of JPG pages is ready.</p>
                <DownloadButton blob={result.blob} filename={result.filename} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}