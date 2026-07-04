import { NextResponse } from "next/server";
import { splitPdf } from "@/lib/pdf-tools/split";
import { readPdfBuffers, jsonError } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const mode = (form.get("mode")?.toString() || "single") as "pages" | "single";
    if (mode !== "pages" && mode !== "single") {
      return jsonError("mode must be 'pages' or 'single'.", 400);
    }
    const pages = form.get("pages")?.toString() || "";
    const upload = await readPdfBuffers(form, { min: 1, maxFiles: 1 });
    if (!upload.ok) return jsonError(upload.error, upload.status);
    const result = await splitPdf(upload.buffers[0], { mode, pages });
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