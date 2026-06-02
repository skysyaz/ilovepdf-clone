import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { decrypt } from "node-qpdf2";

export interface UnlockResult {
  bytes: Uint8Array;
}

export async function unlockPdf(
  buffer: Uint8Array,
  options: { password: string }
): Promise<UnlockResult> {
  if (!options.password) {
    throw new Error("A password is required to unlock the PDF.");
  }
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "ilovepdf-unlock-"));
  const inputPath = path.join(tmpDir, "in.pdf");
  const outputPath = path.join(tmpDir, "out.pdf");
  try {
    await fs.writeFile(inputPath, Buffer.from(buffer));
    try {
      await decrypt({
        input: inputPath,
        output: outputPath,
        password: options.password,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/ENOENT/.test(msg) || /spawn qpdf/.test(msg) || /qpdf/i.test(msg)) {
        throw new Error(
          "Password unlock needs the qpdf binary, which isn't available in this free serverless host. " +
            "Run the project locally (`npm run dev`) to use this tool, or upgrade to a host that supports native binaries."
        );
      }
      throw e;
    }
    // node-qpdf2 returns an empty Buffer even when `output` is set; read from disk.
    const final: Buffer = await fs.readFile(outputPath);
    return { bytes: new Uint8Array(final) };
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
