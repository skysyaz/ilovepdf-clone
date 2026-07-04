import { NextResponse } from "next/server";
import { rotatePdf, type RotateAngle } from "@/lib/pdf-tools/rotate";
import { readPdfBuffers, jsonError } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const angleRaw = parseInt(form.get("angle")?.toString() || "90", 10);
    if (![90, 180, 270].includes(angleRaw)) {
      return jsonError("angle must be 90, 180 or 270.", 400);
    }
    const upload = await readPdfBuffers(form, { min: 1, maxFiles: 1 });
    if (!upload.ok) return jsonError(upload.error, upload.status);
    const result = await rotatePdf(upload.buffers[0], angleRaw as RotateAngle);
    return new NextResponse(Buffer.from(result.bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="rotated-${angleRaw}.pdf"`,
        "Content-Length": String(result.bytes.byteLength),
        "X-Page-Count": String(result.pageCount),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Rotate failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}