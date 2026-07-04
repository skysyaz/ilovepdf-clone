import { NextResponse } from "next/server";
import { mergePdfs } from "@/lib/pdf-tools/merge";
import { readPdfBuffers, jsonError } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const upload = await readPdfBuffers(form, { min: 2, maxFiles: 20 });
    if (!upload.ok) return jsonError(upload.error, upload.status);
    const result = await mergePdfs(upload.buffers);
    return new NextResponse(Buffer.from(result.bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="merged.pdf"',
        "Content-Length": String(result.bytes.byteLength),
        "X-Page-Count": String(result.pageCount),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Merge failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}