import { NextRequest, NextResponse } from "next/server";
import { watermarkPdf } from "@/lib/pdf-tools/watermark";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("files");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "A single PDF file is required." },
        { status: 400 }
      );
    }
    const text = form.get("text")?.toString() || "";
    if (!text.trim()) {
      return NextResponse.json(
        { error: "Watermark text is required." },
        { status: 400 }
      );
    }
    const fontSize = parseInt(form.get("fontSize")?.toString() || "60", 10);
    const opacity = parseFloat(form.get("opacity")?.toString() || "0.3");
    const rotation = parseFloat(form.get("rotation")?.toString() || "45");
    const color = form.get("color")?.toString() || "#E5322D";
    const buffer = new Uint8Array(await file.arrayBuffer());
    const result = await watermarkPdf(buffer, {
      text,
      fontSize,
      opacity,
      rotation,
      color,
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
