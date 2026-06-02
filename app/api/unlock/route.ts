import { NextRequest, NextResponse } from "next/server";
import { unlockPdf } from "@/lib/pdf-tools/unlock";

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
    const password = form.get("password")?.toString() || "";
    if (!password) {
      return NextResponse.json(
        { error: "A password is required to unlock the PDF." },
        { status: 400 }
      );
    }
    const buffer = new Uint8Array(await file.arrayBuffer());
    const result = await unlockPdf(buffer, { password });
    return new NextResponse(Buffer.from(result.bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="unlocked.pdf"',
        "Content-Length": String(result.bytes.byteLength),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unlock failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
