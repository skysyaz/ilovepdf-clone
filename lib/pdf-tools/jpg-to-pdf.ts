import { PDFDocument } from "pdf-lib";

export interface JpgToPdfResult {
  bytes: Uint8Array;
  pageCount: number;
}

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 36;

function detectMime(file: File): "jpg" | "png" | null {
  const t = (file.type || "").toLowerCase();
  if (t === "image/jpeg" || t === "image/jpg" || /\.jpe?g$/i.test(file.name)) {
    return "jpg";
  }
  if (t === "image/png" || /\.png$/i.test(file.name)) {
    return "png";
  }
  return null;
}

async function readImageDimensions(
  bytes: Uint8Array,
  kind: "jpg" | "png"
): Promise<{ width: number; height: number }> {
  // Quick dimension probe by reading the PNG IHDR or JPEG SOFn marker. This
  // avoids pulling in `sharp` (which has native binaries that fail on
  // serverless hosts).
  if (kind === "png") {
    // PNG: bytes 16..24 are width(4) and height(4) big-endian.
    if (bytes.length < 24) throw new Error("PNG too small");
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const width = view.getUint32(16);
    const height = view.getUint32(20);
    return { width, height };
  }
  // JPEG: walk markers to find SOF0/SOF2.
  let i = 2; // skip 0xFFD8
  while (i < bytes.length) {
    if (bytes[i] !== 0xff) throw new Error("Invalid JPEG");
    const marker = bytes[i + 1];
    i += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;
    if ((marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) continue;
    const segLen = (bytes[i] << 8) | bytes[i + 1];
    if (
      marker === 0xc0 ||
      marker === 0xc1 ||
      marker === 0xc2 ||
      marker === 0xc3
    ) {
      // SOFn: skip 1 byte (precision), then read height(2), width(2)
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const height = view.getUint16(i + 3);
      const width = view.getUint16(i + 5);
      return { width, height };
    }
    i += segLen;
  }
  throw new Error("Could not parse JPEG dimensions");
}

/**
 * Convert a list of image files (jpg, jpeg, png) into a single PDF.
 * Each image becomes one page, scaled to fit an A4 page with margins.
 *
 * No native dependencies (no sharp / no canvas) — works on any JS runtime.
 */
export async function imagesToPdf(files: File[]): Promise<JpgToPdfResult> {
  if (!files.length) throw new Error("At least one image is required.");

  const doc = await PDFDocument.create();
  doc.setProducer("iLovePDF Clone (pdf-lib)");

  for (const file of files) {
    const kind = detectMime(file);
    if (!kind) {
      throw new Error(
        `Unsupported image type: ${file.type || file.name}. Use JPG or PNG.`
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    const { width: imgW, height: imgH } = await readImageDimensions(
      bytes,
      kind
    );

    const page = doc.addPage([PAGE_W, PAGE_H]);

    const maxW = PAGE_W - MARGIN * 2;
    const maxH = PAGE_H - MARGIN * 2;
    const scale = Math.min(maxW / imgW, maxH / imgH, 1);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const x = (PAGE_W - drawW) / 2;
    const y = (PAGE_H - drawH) / 2;

    const image =
      kind === "jpg" ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
    page.drawImage(image, { x, y, width: drawW, height: drawH });
  }

  const bytes = await doc.save({ useObjectStreams: true });
  return { bytes, pageCount: doc.getPageCount() };
}
