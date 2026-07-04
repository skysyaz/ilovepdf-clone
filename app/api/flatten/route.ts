import { NextResponse } from "next/server";
import { flattenForm } from "@/lib/pdf-tools/flatten";
import { readPdfBuffers, jsonError } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const upload = await readPdfBuffers(form, { min: 1, maxFiles: 1 });
    if (!upload.ok) return jsonError(upload.error, upload.status);
    const result = await flattenForm(upload.buffers[0]);
    return new NextResponse(Buffer.from(result.bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="flattened.pdf"',
        "Content-Length": String(result.bytes.byteLength),
        "X-Field-Count": String(result.fieldCount),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Flatten failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}