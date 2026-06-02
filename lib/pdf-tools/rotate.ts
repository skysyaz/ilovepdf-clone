import { degrees, PDFDocument } from "pdf-lib";

export interface RotateResult {
  bytes: Uint8Array;
  pageCount: number;
}

export type RotateAngle = 90 | 180 | 270;

export async function rotatePdf(
  buffer: Uint8Array,
  angle: RotateAngle
): Promise<RotateResult> {
  if (![90, 180, 270].includes(angle)) {
    throw new Error("Angle must be 90, 180, or 270.");
  }
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const pages = doc.getPages();
  for (const page of pages) {
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + angle) % 360));
  }
  const bytes = await doc.save({ useObjectStreams: true });
  return { bytes, pageCount: pages.length };
}
