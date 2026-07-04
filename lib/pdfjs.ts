// Shared pdf.js bootstrap. The worker is self-hosted at /pdf.worker.min.mjs
// (copied from node_modules in the `postinstall` step) so the in-browser tools
// work offline and don't depend on a third-party CDN. Same-origin also means
// the service worker can cache it.
export const PDFJS_WORKER_SRC = "/pdf.worker.min.mjs";

export async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;
  return pdfjs;
}