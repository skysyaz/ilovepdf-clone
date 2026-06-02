# iLovePDF Clone

A from-scratch Next.js 14 (App Router) + TypeScript + Tailwind CSS clone of
iLovePDF, offering 10 essential PDF tools. Built with real, end-to-end
processing — no stubs.

## Tools

| # | Tool        | UI route      | API route          | Runs on |
|---|-------------|---------------|--------------------|---------|
| 1 | Merge PDF   | `/merge`      | `/api/merge`       | Server (Worker) |
| 2 | Split PDF   | `/split`      | `/api/split`       | Server (Worker) |
| 3 | Compress    | `/compress`   | `/api/compress`    | Server (Worker) |
| 4 | Rotate      | `/rotate`     | `/api/rotate`      | Server (Worker) |
| 5 | JPG → PDF   | `/jpg-to-pdf` | `/api/jpg-to-pdf`  | Server (Worker) |
| 6 | PDF → JPG   | `/pdf-to-jpg` | (no server route)  | **Browser (pdf.js)** |
| 7 | Watermark   | `/watermark`  | `/api/watermark`   | Server (Worker) |
| 8 | Protect     | `/protect`    | `/api/protect`     | Server (Worker) |
| 9 | Unlock      | `/unlock`     | `/api/unlock`      | Server (Worker) |
| 10| Organize    | `/organize`   | `/api/organize`    | Server (Worker) — thumbnails render in browser |

## Tech stack

- **Next.js 14** App Router + **TypeScript** + **Tailwind CSS v3**
- **pdf-lib** — merge, split, rotate, watermark, organize, JPG→PDF
- **pdfjs-dist** — PDF→JPG and Organize thumbnails (both render in the browser)
- **@pdfsmaller/pdf-encrypt** + **@pdfsmaller/pdf-decrypt** — AES-256 protect/unlock
  (pure JS / Web Crypto, no native binaries — works on any serverless host)
- **react-dropzone** — drag-and-drop uploads
- **@dnd-kit** — drag-to-reorder on the organize page
- **jszip** + **file-saver** — multi-file downloads

## Brand

| Token | Hex |
|-------|-----|
| Brand (primary red) | `#E5322D` |
| Brand hover (orange) | `#FF6B35` |
| Ink (body text) | `#1F2937` |
| Canvas (background) | `#F9FAFB` |

## Develop

```bash
cd /workspace/ilovepdf
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
```

## API contract

All endpoints accept `multipart/form-data`:

- `files` (1 or more, repeated) — the source file(s)
- tool-specific fields (`pages`, `angle`, `password`, `text`, `pageOrder`, etc.)

Single PDF results return `application/pdf` with
`Content-Disposition: attachment; filename="..."`. Multi-file results
(split, pdf-to-jpg) return `application/zip`. Errors return
`{ "error": "..." }` as JSON with a 4xx/5xx status.

## Notes / limitations

- pdf-lib's "compression" is a lossless re-save with stripped metadata and
  packed object streams; it does not re-encode embedded JPEGs/PNGs.
- PDF→JPG renders every page in the browser with pdf.js — no server route.
- Protect/Unlock use pure-JS Web Crypto (no `qpdf` binary required).
- Files are processed in memory — nothing is written to long-term storage.
