"use client";

import { useState } from "react";

export interface ProcessButtonProps {
  endpoint: string;
  files: File[];
  fields?: Record<string, string>;
  label: string;
  onResult: (blob: Blob, filename: string) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

export default function ProcessButton({
  endpoint,
  files,
  fields = {},
  label,
  onResult,
  onError,
  disabled,
}: ProcessButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!files.length || loading) return;
    setLoading(true);
    try {
      const form = new FormData();
      for (const f of files) form.append("files", f, f.name);
      for (const [k, v] of Object.entries(fields)) {
        if (v !== undefined && v !== null) form.append(k, String(v));
      }
      const res = await fetch(endpoint, { method: "POST", body: form });
      if (!res.ok) {
        let msg = `Request failed (${res.status})`;
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch {
          /* ignore */
        }
        onError(msg);
        return;
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition") || "";
      const match = /filename="?([^"]+)"?/i.exec(cd);
      const filename = match?.[1] || "result.pdf";
      onResult(blob, filename);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading || !files.length}
      className="btn-primary"
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          Processing…
        </>
      ) : (
        label
      )}
    </button>
  );
}
