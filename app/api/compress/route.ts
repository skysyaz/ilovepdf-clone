import { NextResponse } from "next/server";
import { compressPdf } from "@/lib/pdf-tools/compress";
import { readPdfBuffers, jsonError } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const upload = await readPdfBuffers(form, { min: 1, maxFiles: 1 });
    if (!upload.ok) return jsonError(upload.error, upload.status);
    const result = await compressPdf(upload.buffers[0]);
    return new NextResponse(Buffer.from(result.bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="compressed.pdf"',
        "Content-Length": String(result.bytes.byteLength),
        "X-Original-Size": String(result.originalSize),
        "X-Result-Size": String(result.resultSize),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Compression failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}