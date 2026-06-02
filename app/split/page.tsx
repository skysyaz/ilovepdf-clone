"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";

type Mode = "single" | "pages";

export default function SplitPage() {
  const [mode, setMode] = useState<Mode>("single");
  const [pages, setPages] = useState("1-3");

  return (
    <ToolShell
      title="Split PDF"
      description="Separate one page or a whole set into independent PDF files."
      endpoint="/api/split"
      accept={{ "application/pdf": [".pdf"] }}
      processLabel="Split PDF"
      options={
        <div className="space-y-4">
          <div>
            <span className="label">Split mode</span>
            <div className="grid gap-2 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 ${
                  mode === "single"
                    ? "border-brand bg-brand/5"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  className="mt-1"
                  checked={mode === "single"}
                  onChange={() => setMode("single")}
                />
                <div>
                  <p className="text-sm font-medium text-ink">
                    Split into single pages
                  </p>
                  <p className="text-xs text-gray-500">
                    One PDF per page. Best for sharing one chart at a time.
                  </p>
                </div>
              </label>
              <label
                className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 ${
                  mode === "pages"
                    ? "border-brand bg-brand/5"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  className="mt-1"
                  checked={mode === "pages"}
                  onChange={() => setMode("pages")}
                />
                <div>
                  <p className="text-sm font-medium text-ink">
                    Extract specific pages
                  </p>
                  <p className="text-xs text-gray-500">
                    e.g. &quot;1-3,5,7-9&quot; — consecutive runs become one PDF.
                  </p>
                </div>
              </label>
            </div>
          </div>
          {mode === "pages" && (
            <div>
              <label className="label" htmlFor="pages">
                Pages to extract
              </label>
              <input
                id="pages"
                className="input"
                type="text"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                placeholder="1-3,5,7-9"
              />
            </div>
          )}
        </div>
      }
      buildFields={() => ({ mode, pages })}
    />
  );
}
