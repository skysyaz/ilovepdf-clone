"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";

export default function PdfToJpgPage() {
  const [quality, setQuality] = useState(85);
  return (
    <ToolShell
      title="PDF to JPG"
      description="Render every page of your PDF as a high-quality JPG image. You will get a zip of all pages."
      endpoint="/api/pdf-to-jpg"
      accept={{ "application/pdf": [".pdf"] }}
      processLabel="Convert to JPG"
      options={
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="quality">
              JPEG quality ({quality}%)
            </label>
            <input
              id="quality"
              type="range"
              min={30}
              max={100}
              step={5}
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value, 10))}
              className="w-full accent-brand"
            />
            <p className="text-xs text-gray-500">
              Lower quality → smaller file size. 85 is a good default.
            </p>
          </div>
        </div>
      }
      buildFields={() => ({ quality: String(quality) })}
    />
  );
}
