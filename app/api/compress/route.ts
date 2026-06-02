import { NextRequest, NextResponse } from "next/server";
import { compressPdf } from "@/lib/pdf-tools/compress";

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
    const buffer = new Uint8Array(await file.arrayBuffer());
    const result = await compressPdf(buffer);
    return new NextResponse(Buffer.from(result.bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="compressed.pdf"',
        "Content-Length": String(result.bytes.byteLength),
        "X-Original-Size": String(result.originalSize),
        "X-Result-Size": String(result.resultSize),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Compression failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
