import { degrees, PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface WatermarkResult {
  bytes: Uint8Array;
  pageCount: number;
}

export interface WatermarkOptions {
  text: string;
  fontSize?: number;
  opacity?: number; // 0..1
  rotation?: number; // degrees
  color?: string; // hex like "#E5322D"
}

function hexToRgb01(hex: string): { r: number; g: number; b: number } {
  const h = hex.trim().replace(/^#/, "");
  // Support #rgb and #rrggbb. Fall back to brand red on anything else.
  if (/^[0-9a-fA-F]{6}$/.test(h)) {
    const v = parseInt(h, 16);
    return { r: ((v >> 16) & 0xff) / 255, g: ((v >> 8) & 0xff) / 255, b: (v & 0xff) / 255 };
  }
  if (/^[0-9a-fA-F]{3}$/.test(h)) {
    const r = parseInt(h[0], 16), g = parseInt(h[1], 16), b = parseInt(h[2], 16);
    return { r: ((r * 17) / 255), g: ((g * 17) / 255), b: ((b * 17) / 255) };
  }
  return { r: 229 / 255, g: 50 / 255, b: 45 / 255 };
}

export async function watermarkPdf(
  buffer: Uint8Array,
  options: WatermarkOptions
): Promise<WatermarkResult> {
  if (!options.text || !options.text.trim()) {
    throw new Error("Watermark text is required.");
  }
  const fontSize = Math.min(200, Math.max(8, options.fontSize ?? 60));
  const opacity = Math.min(1, Math.max(0, options.opacity ?? 0.3));
  // Clamp rotation to a sane range; pdf-lib accepts any number but a wild
  // value just produces an odd-looking watermark.
  const rotation = Math.min(360, Math.max(-360, options.rotation ?? 45));
  const color = hexToRgb01(options.color || "#E5322D");

  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = doc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const text = options.text;
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: (height - textHeight) / 2,
      size: fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
      opacity,
      rotate: degrees(rotation),
    });
  }

  const bytes = await doc.save({ useObjectStreams: true });
  return { bytes, pageCount: pages.length };
}
