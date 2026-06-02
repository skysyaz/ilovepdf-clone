import { NextRequest, NextResponse } from "next/server";
import { imagesToPdf } from "@/lib/pdf-tools/jpg-to-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const files = form.getAll("files").filter((f): f is File => f instanceof File);
    if (!files.length) {
      return NextResponse.json(
        { error: "At least one image is required." },
        { status: 400 }
      );
    }
    const result = await imagesToPdf(files);
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
