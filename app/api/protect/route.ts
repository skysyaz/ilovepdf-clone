import { NextResponse } from "next/server";
import { protectPdf } from "@/lib/pdf-tools/protect";
import { readPdfBuffers, jsonError } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const password = form.get("password")?.toString() || "";
    if (!password) {
      return jsonError("A password is required to protect the PDF.", 400);
    }
    const upload = await readPdfBuffers(form, { min: 1, maxFiles: 1 });
    if (!upload.ok) return jsonError(upload.error, upload.status);
    const result = await protectPdf(upload.buffers[0], { password });
    return new NextResponse(Buffer.from(result.bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="protected.pdf"',
        "Content-Length": String(result.bytes.byteLength),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Protect failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}