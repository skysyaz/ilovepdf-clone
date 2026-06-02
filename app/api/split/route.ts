import { NextRequest, NextResponse } from "next/server";
import { splitPdf } from "@/lib/pdf-tools/split";

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
    const mode = (form.get("mode")?.toString() || "single") as "pages" | "single";
    if (mode !== "pages" && mode !== "single") {
      return NextResponse.json(
        { error: "mode must be 'pages' or 'single'." },
        { status: 400 }
      );
    }
    const pages = form.get("pages")?.toString() || "";
    const buffer = new Uint8Array(await file.arrayBuffer());
    const result = await splitPdf(buffer, { mode, pages });
    return new NextResponse(Buffer.from(result.zip), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="split.zip"',
        "Content-Length": String(result.zip.byteLength),
        "X-File-Count": String(result.fileCount),
        "X-Mode": result.mode,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Split failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
