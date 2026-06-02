"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";

export default function ProtectPage() {
  const [password, setPassword] = useState("");
  return (
    <ToolShell
      title="Protect PDF"
      description="Encrypt your PDF with a strong 256-bit AES password. The user password is required to open the file."
      endpoint="/api/protect"
      accept={{ "application/pdf": [".pdf"] }}
      processLabel="Protect PDF"
      requiresFields={!password}
      options={
        <div className="space-y-2">
          <label className="label" htmlFor="pw">User password</label>
          <input
            id="pw"
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a strong password"
            autoComplete="new-password"
          />
          <p className="text-xs text-gray-500">
            Powered by qpdf with 256-bit AES encryption. The owner password
            defaults to the same value.
          </p>
        </div>
      }
      buildFields={() => ({ password })}
    />
  );
}
