import { PDFDocument } from "pdf-lib";
import { parsePageList } from "@/lib/utils";

export interface OrganizeResult {
  bytes: Uint8Array;
  pageCount: number;
}

/**
 * Reorder / extract pages of a PDF.
 *   pageOrder = "1,3,2,4" → reorders pages into 1,3,2,4
 *   pageOrder = "1-3,5"   → extracts pages 1..3 and 5 (also reorders)
 * Page numbers are 1-based; duplicates are removed (first occurrence kept).
 */
export async function organizePdf(
  buffer: Uint8Array,
  options: { pageOrder: string }
): Promise<OrganizeResult> {
  if (!options.pageOrder || !options.pageOrder.trim()) {
    throw new Error("A page order is required. Example: 1,3,2,4");
  }
  const src = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const total = src.getPageCount();
  const order = parsePageList(options.pageOrder, total);
  if (!order.length) {
    throw new Error("No valid page numbers found in the order.");
  }
  // Convert to 0-based unique indices, preserving requested order.
  const seen = new Set<number>();
  const indices: number[] = [];
  for (const p of order) {
    const idx = p - 1;
    if (seen.has(idx)) continue;
    seen.add(idx);
    indices.push(idx);
  }
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, indices);
  for (const p of pages) out.addPage(p);
  const bytes = await out.save({ useObjectStreams: true });
  return { bytes, pageCount: out.getPageCount() };
}
