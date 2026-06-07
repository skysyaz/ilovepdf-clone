import { NextRequest, NextResponse } from "next/server";
import { flattenForm } from "@/lib/pdf-tools/flatten";

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
    const result = await flattenForm(buffer);
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
