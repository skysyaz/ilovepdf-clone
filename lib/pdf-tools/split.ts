import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { parsePageList, splitRanges } from "@/lib/utils";

export interface SplitResult {
  mode: "pages" | "single";
  zip: Uint8Array; // always returns a zip — one or many PDFs inside
  fileCount: number;
}

async function makePdfFromPages(
  src: PDFDocument,
  pageIndices: number[]
): Promise<Uint8Array> {
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, pageIndices);
  for (const p of pages) out.addPage(p);
  out.setProducer("iLovePDF Clone (pdf-lib)");
  return await out.save({ useObjectStreams: true });
}

/**
 * Split a PDF.
 *  - mode="single"  → one PDF per page
 *  - mode="pages"   → input "pages" describes which 1-based pages to extract;
 *                     consecutive runs become one PDF (so "1-3,5,7-9" yields 2 PDFs).
 * Returns a zip of one or more PDFs.
 */
export async function splitPdf(
  buffer: Uint8Array,
  options: { mode: "pages" | "single"; pages?: string }
): Promise<SplitResult> {
  const src = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const total = src.getPageCount();

  if (options.mode === "single") {
    const zip = new JSZip();
    for (let i = 0; i < total; i++) {
      const bytes = await makePdfFromPages(src, [i]);
      zip.file(`page-${String(i + 1).padStart(3, "0")}.pdf`, bytes);
    }
    const zipBuf = await zip.generateAsync({ type: "uint8array" });
    return { mode: "single", zip: zipBuf, fileCount: total };
  }

  const list = parsePageList(options.pages || "", total);
  if (list.length === 0) {
    throw new Error("No valid pages provided. Use a format like 1-3,5,7.");
  }
  const ranges = splitRanges(list);
  const zip = new JSZip();
  let idx = 0;
  for (const [lo, hi] of ranges) {
    idx += 1;
    const indices: number[] = [];
    for (let p = lo; p <= hi; p++) indices.push(p - 1);
    const bytes = await makePdfFromPages(src, indices);
    const label =
      lo === hi ? `page-${lo}.pdf` : `pages-${lo}-to-${hi}.pdf`;
    zip.file(label, bytes);
  }
  const zipBuf = await zip.generateAsync({ type: "uint8array" });
  return { mode: "pages", zip: zipBuf, fileCount: idx };
}
