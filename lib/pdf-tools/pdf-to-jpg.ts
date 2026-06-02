// Render PDF pages as images.
//
// Strategy: extract embedded images from each page (works great for scanned
// / image-based PDFs). Falls back to a "page snapshot" placeholder for
// text-only pages — Cloudflare Workers free tier has a 1 MB script limit,
// so a full renderer (mupdf / pdfjs+canvas) doesn't fit. The user can
// upgrade to Workers Paid ($5/month) and swap in mupdf for full rendering.
//
// Pure JS, no native dependencies, works on any runtime.

import JSZip from "jszip";
import {
  PDFDocument,
  PDFName,
  PDFRawStream,
  PDFArray,
  PDFDict,
  PDFStream,
  PDFNumber,
  PDFRef,
} from "pdf-lib";

export interface PdfToJpgResult {
  zip: Uint8Array;
  pageCount: number;
}

interface ExtractedImage {
  bytes: Uint8Array;
  filter: string; // "DCTDecode" for JPEG, "FlateDecode" or "JPXDecode" for others
}

function decodeStream(stream: PDFStream): Uint8Array {
  // For DCTDecode (JPEG) streams, `contents` holds the raw JPEG bytes.
  // For FlateDecode streams, pdf-lib auto-decodes on access.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (stream as any).contents as Uint8Array;
}

async function extractImagesFromPage(
  doc: PDFDocument,
  pageIndex: number
): Promise<{ width: number; height: number; images: ExtractedImage[] }> {
  const pages = doc.getPages();
  const page = pages[pageIndex];
  const { width, height } = page.getSize();
  const resources = page.node.Resources();
  if (!resources) return { width, height, images: [] };
  const xobjects = resources.lookup(PDFName.of("XObject"));
  if (!(xobjects instanceof PDFDict)) return { width, height, images: [] };

  const images: ExtractedImage[] = [];
  for (const [, ref] of xobjects.entries()) {
    try {
      const obj = doc.context.lookup(ref) as PDFStream | PDFDict | undefined;
      if (!obj || !(obj instanceof PDFStream)) continue;
      const subtype = obj.dict.lookup(PDFName.of("Subtype"));
      if (subtype?.toString() !== "/Image") continue;
      const filter = obj.dict.lookup(PDFName.of("Filter"));
      const filterName = filter?.toString().replace(/^\//, "") ?? "";
      if (filterName === "DCTDecode") {
        // JPEG — bytes are ready to use.
        images.push({ bytes: decodeStream(obj as PDFStream), filter: "jpeg" });
      } else if (filterName === "FlateDecode" || filterName === "") {
        // Raw / Flate — we'd need to PNG-encode it. Skip for simplicity.
        continue;
      } else if (filterName === "JPXDecode") {
        // JPEG2000 — skip (no decoder in browser without a WASM lib).
        continue;
      }
    } catch {
      continue;
    }
  }
  return { width, height, images };
}

async function jpegBytesFromRgba(
  width: number,
  height: number,
  rgba: Uint8Array
): Promise<Uint8Array> {
  // Use sharp on Node / Netlify. Fallback: PNG bytes (still a valid image).
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sharp = (await import("sharp")).default;
    return await sharp(Buffer.from(rgba), {
      raw: { width, height, channels: 4 },
    })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();
  } catch {
    // No sharp (Cloudflare Workers). Emit a 1x1 white JPEG so the file
    // is at least a valid image. Real rendering requires a paid Cloudflare
    // plan or self-hosting.
    return new Uint8Array([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
      0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
      0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
      0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
      0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00,
      0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
      0x09, 0x0a, 0x0b, 0xff, 0xc4, 0x00, 0xb5, 0x10, 0x00, 0x02, 0x01, 0x03,
      0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7d,
      0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
      0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08,
      0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0, 0x24, 0x33, 0x62, 0x72,
      0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28,
      0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45,
      0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
      0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75,
      0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
      0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3,
      0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6,
      0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9,
      0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2,
      0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4,
      0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01,
      0x00, 0x00, 0x3f, 0x00, 0xfb, 0xd0, 0xff, 0xd9,
    ]);
  }
}

/**
 * Extract images from each page of a PDF and return a zip of JPEGs.
 * Best-effort: works fully for image-based (scanned) PDFs. For text-only
 * PDFs, returns a single 1x1 placeholder image per page.
 */
export async function pdfToJpg(
  buffer: Uint8Array,
  _options: { quality?: number; scale?: number } = {}
): Promise<PdfToJpgResult> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const pageCount = doc.getPageCount();
  const zip = new JSZip();

  let hadAnyImage = false;
  for (let i = 0; i < pageCount; i++) {
    const { width, height, images } = await extractImagesFromPage(doc, i);
    if (images.length > 0) {
      // Save each extracted image (one file per embedded image).
      for (let j = 0; j < images.length; j++) {
        const img = images[j];
        zip.file(`page-${String(i + 1).padStart(3, "0")}-img${j + 1}.jpg`, img.bytes);
      }
      hadAnyImage = true;
    } else {
      // No embedded image on this page — emit a placeholder so the user
      // still gets a valid JPG per page. Full rendering requires a paid
      // Cloudflare plan or self-hosting.
      const whiteRgba = new Uint8Array(width * height * 4); // all zeros = black
      const jpeg = await jpegBytesFromRgba(width, height, whiteRgba);
      zip.file(`page-${String(i + 1).padStart(3, "0")}.jpg`, jpeg);
    }
  }

  if (!hadAnyImage) {
    // Add a note file in the zip so the user knows what happened.
    zip.file(
      "README.txt",
      `iLovePDF — PDF to JPG on Cloudflare Workers (free tier)\n\n` +
        `This PDF did not contain any embedded JPEG images (DCTDecode streams).\n` +
        `For text-only or vector PDFs, full rendering requires a native PDF\n` +
        `renderer (mupdf, poppler, etc.) which exceeds the 1 MB Workers\n` +
        `script size limit on the free plan.\n\n` +
        `Options:\n` +
        `  1. Upgrade to Cloudflare Workers Paid ($5/month) — then mupdf fits.\n` +
        `  2. Self-host the project (cd /workspace/ilovepdf && npm run dev) — all 10 tools work.\n` +
        `  3. Use a scanned / image-based PDF — those work today.\n`
    );
  }

  const out = await zip.generateAsync({ type: "uint8array" });
  return { zip: out, pageCount };
}
