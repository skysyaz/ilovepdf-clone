"use client";

import ToolShell from "@/components/ToolShell";

export default function CompressPage() {
  return (
    <ToolShell
      title="Compress PDF"
      description="Reduce file size by re-saving the PDF with packed object streams and stripped metadata."
      endpoint="/api/compress"
      accept={{ "application/pdf": [".pdf"] }}
      hint="Best for PDFs with lots of metadata, fonts, or images. Re-save is lossless on text."
      processLabel="Compress PDF"
      options={
        <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-medium">How compression works</p>
          <p className="mt-1 text-xs">
            We re-save the PDF with the most aggressive options pdf-lib
            supports, remove metadata, and pack object streams. For deeply
            image-heavy PDFs, the size reduction comes from stream packing; for
            text-heavy PDFs it comes mainly from metadata removal.
          </p>
        </div>
      }
      buildFields={() => ({})}
    />
  );
}
