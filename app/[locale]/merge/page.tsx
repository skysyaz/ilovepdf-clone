"use client";

import ToolShell from "@/components/ToolShell";

export default function MergePage() {
  return (
    <ToolShell
      title="Merge PDF"
      description="Combine PDFs in the order you want. Use the up/down arrows to reorder."
      endpoint="/api/merge"
      multiple
      accept={{ "application/pdf": [".pdf"] }}
      hint="Drop 2 or more PDF files. The order in the list is the merge order."
      processLabel="Merge PDFs"
      options={null}
      buildFields={() => ({})}
    />
  );
}
