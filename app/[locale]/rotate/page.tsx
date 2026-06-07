"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";

export default function RotatePage() {
  const [angle, setAngle] = useState<90 | 180 | 270>(90);
  return (
    <ToolShell
      title="Rotate PDF"
      description="Rotate every page in your PDF by 90, 180, or 270 degrees."
      endpoint="/api/rotate"
      accept={{ "application/pdf": [".pdf"] }}
      processLabel="Rotate PDF"
      options={
        <div>
          <span className="label">Rotation angle</span>
          <div className="grid grid-cols-3 gap-2">
            {[90, 180, 270].map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAngle(a as 90 | 180 | 270)}
                className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                  angle === a
                    ? "border-brand bg-brand/5 text-brand"
                    : "border-gray-200 bg-white text-ink hover:border-brand/40"
                }`}
              >
                {a}°
              </button>
            ))}
          </div>
        </div>
      }
      buildFields={() => ({ angle: String(angle) })}
    />
  );
}
