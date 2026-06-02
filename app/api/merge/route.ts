import { NextRequest, NextResponse } from "next/server";
import { mergePdfs } from "@/lib/pdf-tools/merge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const files = form.getAll("files").filter((f): f is File => f instanceof File);
    if (files.length < 2) {
      return NextResponse.json(
        { error: "At least 2 PDF files are required to merge." },
        { status: 400 }
      );
    }
    const buffers: Uint8Array[] = [];
    for (const f of files) {
      buffers.push(new Uint8Array(await f.arrayBuffer()));
    }
    const result = await mergePdfs(buffers);
    return new NextResponse(Buffer.from(result.bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="merged.pdf"',
        "Content-Length": String(result.bytes.byteLength),
        "X-Page-Count": String(result.pageCount),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Merge failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
