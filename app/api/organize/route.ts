import { NextRequest, NextResponse } from "next/server";
import { organizePdf } from "@/lib/pdf-tools/organize";

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
    const pageOrder = form.get("pageOrder")?.toString() || "";
    if (!pageOrder.trim()) {
      return NextResponse.json(
        { error: "A pageOrder is required. Example: 1,3,2,4" },
        { status: 400 }
      );
    }
    const buffer = new Uint8Array(await file.arrayBuffer());
    const result = await organizePdf(buffer, { pageOrder });
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
