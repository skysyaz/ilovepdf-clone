// Shared upload validation for /api routes. Enforces magic-byte checks and
// size/count caps so a single malicious/large request can't OOM the worker.
// Pure Uint8Array checks (no Buffer) so it runs on any runtime including
// Cloudflare Workers without nodejs_compat surprises.

export type UploadError = { ok: false; error: string; status: number };
export type PdfOk = { ok: true; buffers: Uint8Array[] };
export type ImageOk = { ok: true; files: File[] };

// "%PDF-"
const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46, 0x2d];

/** JPEG SOI (0xFFD8) or PNG signature. */
function isImage(bytes: Uint8Array): "jpg" | "png" | null {
  if (bytes.length < 8) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "jpg";
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e &&
    bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a &&
    bytes[6] === 0x1a && bytes[7] === 0x0a
  ) return "png";
  return null;
}

function isPdf(bytes: Uint8Array): boolean {
  if (bytes.length < 5) return false;
  for (let i = 0; i < 5; i++) if (bytes[i] !== PDF_MAGIC[i]) return false;
  return true;
}

function fmtBytes(n: number): string {
  if (n >= 1024 * 1024) return `${Math.round(n / 1024 / 1024)} MB`;
  return `${Math.round(n / 1024)} KB`;
}

interface Opts {
  min?: number;
  maxFiles?: number;
  maxFileBytes?: number;
  maxTotalBytes?: number;
}

const DEFAULTS = {
  maxFiles: 20,
  maxFileBytes: 25 * 1024 * 1024,
  maxTotalBytes: 50 * 1024 * 1024,
};

function collectFiles(form: FormData): File[] {
  return form.getAll("files").filter((f): f is File => f instanceof File);
}

/** Read & validate one-or-many PDF uploads. Returns PDF bytes ready for pdf-lib. */
export async function readPdfBuffers(
  form: FormData,
  opts: Opts = {}
): Promise<PdfOk | UploadError> {
  const maxFiles = opts.maxFiles ?? DEFAULTS.maxFiles;
  const maxFileBytes = opts.maxFileBytes ?? DEFAULTS.maxFileBytes;
  const maxTotalBytes = opts.maxTotalBytes ?? DEFAULTS.maxTotalBytes;
  const min = opts.min ?? 1;

  const files = collectFiles(form);
  if (files.length < min) {
    return {
      ok: false,
      status: 400,
      error: min <= 1 ? "A PDF file is required." : `At least ${min} PDF files are required.`,
    };
  }
  if (files.length > maxFiles) {
    return { ok: false, status: 400, error: `At most ${maxFiles} files are allowed.` };
  }

  let total = 0;
  for (const f of files) {
    if (f.size > maxFileBytes) {
      return { ok: false, status: 413, error: `"${f.name}" exceeds the ${fmtBytes(maxFileBytes)} per-file limit.` };
    }
    total += f.size;
  }
  if (total > maxTotalBytes) {
    return { ok: false, status: 413, error: `Total upload exceeds the ${fmtBytes(maxTotalBytes)} limit.` };
  }

  const buffers: Uint8Array[] = [];
  for (const f of files) {
    const buf = new Uint8Array(await f.arrayBuffer());
    if (!isPdf(buf)) {
      return { ok: false, status: 400, error: `"${f.name}" is not a valid PDF.` };
    }
    buffers.push(buf);
  }
  return { ok: true, buffers };
}

/** Read & validate image uploads (JPG/PNG only). Returns the raw Files for embedding. */
export async function readImageFiles(
  form: FormData,
  opts: Opts = {}
): Promise<ImageOk | UploadError> {
  const maxFiles = opts.maxFiles ?? 50;
  const maxFileBytes = opts.maxFileBytes ?? 15 * 1024 * 1024;
  const maxTotalBytes = opts.maxTotalBytes ?? 75 * 1024 * 1024;
  const min = opts.min ?? 1;

  const files = collectFiles(form);
  if (files.length < min) {
    return { ok: false, status: 400, error: "At least one image is required." };
  }
  if (files.length > maxFiles) {
    return { ok: false, status: 400, error: `At most ${maxFiles} images are allowed.` };
  }
  let total = 0;
  for (const f of files) {
    if (f.size > maxFileBytes) {
      return { ok: false, status: 413, error: `"${f.name}" exceeds the ${fmtBytes(maxFileBytes)} per-file limit.` };
    }
    total += f.size;
  }
  if (total > maxTotalBytes) {
    return { ok: false, status: 413, error: `Total upload exceeds the ${fmtBytes(maxTotalBytes)} limit.` };
  }
  for (const f of files) {
    const buf = new Uint8Array(await f.arrayBuffer());
    if (!isImage(buf)) {
      return { ok: false, status: 400, error: `"${f.name}" is not a supported image (JPG or PNG only).` };
    }
  }
  return { ok: true, files };
}

/** Send a uniform JSON error. */
export function jsonError(error: string, status: number) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}