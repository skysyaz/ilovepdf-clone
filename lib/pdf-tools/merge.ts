import { PDFDocument } from "pdf-lib";

export interface MergeResult {
  bytes: Uint8Array;
  pageCount: number;
}

/**
 * Merge multiple PDFs into a single PDF, preserving order of `buffers`.
 * Throws if fewer than 2 PDFs are supplied.
 */
export async function mergePdfs(buffers: Uint8Array[]): Promise<MergeResult> {
  if (!buffers || buffers.length < 2) {
    throw new Error("At least 2 PDF files are required to merge.");
  }
  const out = await PDFDocument.create();
  for (const buf of buffers) {
    const src = await PDFDocument.load(buf, { ignoreEncryption: true });
    const pages = await out.copyPages(src, src.getPageIndices());
    for (const p of pages) out.addPage(p);
  }
  out.setTitle("Merged PDF");
  out.setProducer("iLovePDF Clone (pdf-lib)");
  out.setCreator("iLovePDF Clone");
  const bytes = await out.save({ useObjectStreams: true });
  return { bytes, pageCount: out.getPageCount() };
}
