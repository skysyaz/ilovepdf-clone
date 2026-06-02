// Remove password protection (decrypt) from a PDF using @pdfsmaller/pdf-decrypt.
// Pure JS (Web Crypto API), no native deps, works in any JS runtime
// including Cloudflare Workers free tier.

import { decryptPDF, isEncrypted } from "@pdfsmaller/pdf-decrypt";

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
  const status = await isEncrypted(buffer);
  if (!status.encrypted) {
    throw new Error("This PDF is not password-protected.");
  }
  const bytes = await decryptPDF(buffer, options.password);
  return { bytes };
}
