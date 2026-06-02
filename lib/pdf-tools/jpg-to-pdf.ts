import { PDFDocument } from "pdf-lib";
import sharp from "sharp";

export interface JpgToPdfResult {
  bytes: Uint8Array;
  pageCount: number;
}

/**
 * Convert a list of image files (jpg, jpeg, png, webp, gif) into a single PDF.
 * Each image becomes one page, scaled to fit an A4 page (595x842 pt) with
 * margins. Images are normalized to JPEG via sharp before embedding.
 */
export async function imagesToPdf(files: File[]): Promise<JpgToPdfResult> {
  if (!files.length) throw new Error("At least one image is required.");

  const doc = await PDFDocument.create();
  doc.setProducer("iLovePDF Clone (sharp + pdf-lib)");

  // A4 in points (1pt = 1/72 in).
  const PAGE_W = 595;
  const PAGE_H = 842;
  const MARGIN = 36;

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);

    // Normalize to JPEG bytes.
    const jpeg = await sharp(buf)
      .rotate() // honor EXIF orientation
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer();

    const meta = await sharp(jpeg).metadata();
    const imgW = meta.width || 1;
    const imgH = meta.height || 1;

    const page = doc.addPage([PAGE_W, PAGE_H]);

    // Compute draw size preserving aspect ratio.
    const maxW = PAGE_W - MARGIN * 2;
    const maxH = PAGE_H - MARGIN * 2;
    const scale = Math.min(maxW / imgW, maxH / imgH, 1); // never upscale
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const x = (PAGE_W - drawW) / 2;
    const y = (PAGE_H - drawH) / 2;

    const jpgImage = await doc.embedJpg(jpeg);
    page.drawImage(jpgImage, { x, y, width: drawW, height: drawH });
  }

  const bytes = await doc.save({ useObjectStreams: true });
  return { bytes, pageCount: doc.getPageCount() };
}
