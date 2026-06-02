import { NextRequest, NextResponse } from "next/server";
import { pdfToJpg } from "@/lib/pdf-tools/pdf-to-jpg";

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
    const quality = parseInt(form.get("quality")?.toString() || "85", 10);
    const scale = parseFloat(form.get("scale")?.toString() || "2");
    const buffer = new Uint8Array(await file.arrayBuffer());
    const result = await pdfToJpg(buffer, { quality, scale });
    return new NextResponse(Buffer.from(result.zip), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="pdf-pages.zip"',
        "Content-Length": String(result.zip.byteLength),
        "X-Page-Count": String(result.pageCount),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "PDF→JPG failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
