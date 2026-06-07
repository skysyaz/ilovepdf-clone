"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";

export default function UnlockPage() {
  const [password, setPassword] = useState("");
  return (
    <ToolShell
      title="Unlock PDF"
      description="Remove the password from a PDF so you can read, print, or edit it freely."
      endpoint="/api/unlock"
      accept={{ "application/pdf": [".pdf"] }}
      processLabel="Unlock PDF"
      requiresFields={!password}
      options={
        <div className="space-y-2">
          <label className="label" htmlFor="pw">Current password</label>
          <input
            id="pw"
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="The password the PDF is locked with"
            autoComplete="current-password"
          />
          <p className="text-xs text-gray-500">
            Make sure you have permission to remove the password. The unlocked
            file is generated in-memory and returned as a download.
          </p>
        </div>
      }
      buildFields={() => ({ password })}
    />
  );
}
