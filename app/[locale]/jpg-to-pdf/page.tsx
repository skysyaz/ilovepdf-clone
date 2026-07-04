"use client";

import ToolShell from "@/components/ToolShell";

export default function JpgToPdfPage() {
  return (
    <ToolShell
      title="JPG to PDF"
      description="Convert JPG or PNG images to a single PDF. Each image becomes one A4 page."
      endpoint="/api/jpg-to-pdf"
      multiple
      accept={{
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
      }}
      hint="Drop one or more JPG or PNG images. Each becomes one A4 page."
      processLabel="Convert to PDF"
      options={null}
      buildFields={() => ({})}
    />
  );
}
