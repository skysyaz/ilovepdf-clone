import { NextResponse } from "next/server";
import { imagesToPdf } from "@/lib/pdf-tools/jpg-to-pdf";
import { readImageFiles, jsonError } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const upload = await readImageFiles(form, { min: 1, maxFiles: 50 });
    if (!upload.ok) return jsonError(upload.error, upload.status);
    const result = await imagesToPdf(upload.files);
    return new NextResponse(Buffer.from(result.bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="images.pdf"',
        "Content-Length": String(result.bytes.byteLength),
        "X-Page-Count": String(result.pageCount),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Conversion failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}