"use client";

import ToolShell from "@/components/ToolShell";

export default function FlattenPage() {
  return (
    <ToolShell
      title="Flatten PDF Form"
      description="Bake every form field into static page content. Useful for locking a form after submission or stripping interactive elements before sharing."
      endpoint="/api/flatten"
      accept={{ "application/pdf": [".pdf"] }}
      processLabel="Flatten form"
      options={
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            All text fields, checkboxes, dropdowns, radio buttons and signature
            fields are converted into regular text and shapes. Once flattened,
            the form can no longer be filled in.
          </p>
          <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
            💡 For encrypted PDFs, decryption happens in-memory only — the
            original is never written to disk.
          </div>
        </div>
      }
      buildFields={() => ({})}
    />
  );
}
