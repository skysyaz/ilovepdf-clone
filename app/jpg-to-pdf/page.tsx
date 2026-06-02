"use client";

import ToolShell from "@/components/ToolShell";

export default function JpgToPdfPage() {
  return (
    <ToolShell
      title="JPG to PDF"
      description="Convert JPG, PNG, or WebP images to a single PDF. Each image becomes one page."
      endpoint="/api/jpg-to-pdf"
      multiple
      accept={{
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
        "image/webp": [".webp"],
        "image/gif": [".gif"],
      }}
      hint="Drop one or more images. They will be auto-rotated by EXIF and fit to A4 pages."
      processLabel="Convert to PDF"
      options={null}
      buildFields={() => ({})}
    />
  );
}
