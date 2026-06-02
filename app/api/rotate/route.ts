import { NextRequest, NextResponse } from "next/server";
import { rotatePdf, type RotateAngle } from "@/lib/pdf-tools/rotate";

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
    const angleRaw = parseInt(form.get("angle")?.toString() || "90", 10);
    if (![90, 180, 270].includes(angleRaw)) {
      return NextResponse.json(
        { error: "angle must be 90, 180 or 270." },
        { status: 400 }
      );
    }
    const angle = angleRaw as RotateAngle;
    const buffer = new Uint8Array(await file.arrayBuffer());
    const result = await rotatePdf(buffer, angle);
    return new NextResponse(Buffer.from(result.bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="rotated-${angle}.pdf"`,
        "Content-Length": String(result.bytes.byteLength),
        "X-Page-Count": String(result.pageCount),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Rotate failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
