// PDF-to-JPG needs the `canvas` native module (with cairo / pango) and the
// `pdfjs-dist` worker — neither is available in this free serverless host.
// We surface a clear "hosting limitation" error instead of crashing the
// route. Run the project locally (`npm run dev`) to use this tool.

export interface PdfToJpgResult {
  zip: Uint8Array;
  pageCount: number;
}

export async function pdfToJpg(
  _buffer: Uint8Array,
  _options: { quality?: number; scale?: number } = {}
): Promise<PdfToJpgResult> {
  throw new Error(
    "PDF-to-JPG rendering needs the `canvas` native module (cairo / pango) " +
      "and the pdfjs worker, which aren't available in this free serverless host. " +
      "Run the project locally (`npm run dev`) to use this tool, or upgrade to a host that supports native binaries."
  );
}
