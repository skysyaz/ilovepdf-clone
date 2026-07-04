import { NextResponse } from "next/server";
import { watermarkPdf } from "@/lib/pdf-tools/watermark";
import { readPdfBuffers, jsonError } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const text = form.get("text")?.toString() || "";
    if (!text.trim()) {
      return jsonError("Watermark text is required.", 400);
    }
    const fontSize = parseInt(form.get("fontSize")?.toString() || "60", 10);
    const opacity = parseFloat(form.get("opacity")?.toString() || "0.3");
    const rotation = parseFloat(form.get("rotation")?.toString() || "45");
    const color = form.get("color")?.toString() || "#E5322D";
    const upload = await readPdfBuffers(form, { min: 1, maxFiles: 1 });
    if (!upload.ok) return jsonError(upload.error, upload.status);
    const result = await watermarkPdf(upload.buffers[0], {
      text, fontSize, opacity, rotation, color,
    });
    return new NextResponse(Buffer.from(result.bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="watermarked.pdf"',
        "Content-Length": String(result.bytes.byteLength),
        "X-Page-Count": String(result.pageCount),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Watermark failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}