// Password protect (encrypt) a PDF using @pdfsmaller/pdf-encrypt.
// Pure JS (Web Crypto API), no native deps, works in any JS runtime
// including Cloudflare Workers free tier.

import { encryptPDF } from "@pdfsmaller/pdf-encrypt";

export interface ProtectResult {
  bytes: Uint8Array;
}

export async function protectPdf(
  buffer: Uint8Array,
  options: { password: string }
): Promise<ProtectResult> {
  if (!options.password || !options.password.trim()) {
    throw new Error("A password is required to protect a PDF.");
  }
  const bytes = await encryptPDF(buffer, options.password, {
    ownerPassword: options.password,
    algorithm: "AES-256",
  });
  return { bytes };
}
