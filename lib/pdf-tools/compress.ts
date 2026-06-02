import { PDFDocument } from "pdf-lib";

export interface CompressResult {
  bytes: Uint8Array;
  originalSize: number;
  resultSize: number;
}

/**
 * Compress a PDF using the most aggressive options pdf-lib supports:
 *  - remove metadata
 *  - useObjectStreams (deflate + pack object streams)
 *  - ignoreEncryption so we can still read protected inputs
 *
 * pdf-lib does not re-encode embedded JPEGs/PNGs (that would require a real
 * raster pipeline), but this still strips metadata and re-packs streams,
 * which is the standard "re-save" form of compression.
 */
export async function compressPdf(buffer: Uint8Array): Promise<CompressResult> {
  const originalSize = buffer.byteLength;
  const doc = await PDFDocument.load(buffer, {
    ignoreEncryption: true,
    updateMetadata: false,
  });
  // Strip metadata.
  doc.setTitle("");
  doc.setAuthor("");
  doc.setSubject("");
  doc.setKeywords([]);
  doc.setProducer("iLovePDF Clone");
  doc.setCreator("iLovePDF Clone");

  // Re-save with object streams and high compression.
  const bytes = await doc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 50,
  });
  return {
    bytes,
    originalSize,
    resultSize: bytes.byteLength,
  };
}
