import { NextResponse } from "next/server";
import { organizePdf } from "@/lib/pdf-tools/organize";
import { readPdfBuffers, jsonError } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const pageOrder = form.get("pageOrder")?.toString() || "";
    if (!pageOrder.trim()) {
      return jsonError("A pageOrder is required. Example: 1,3,2,4", 400);
    }
    const upload = await readPdfBuffers(form, { min: 1, maxFiles: 1 });
    if (!upload.ok) return jsonError(upload.error, upload.status);
    const result = await organizePdf(upload.buffers[0], { pageOrder });
    return new NextResponse(Buffer.from(result.bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="organized.pdf"',
        "Content-Length": String(result.bytes.byteLength),
        "X-Page-Count": String(result.pageCount),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Organize failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}