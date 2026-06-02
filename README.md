# iLovePDF Clone

A from-scratch Next.js 14 (App Router) + TypeScript + Tailwind CSS clone of
iLovePDF, offering 10 essential PDF tools. Built with real, end-to-end
processing — no stubs.

## Tools

| # | Tool        | UI route      | API route          |
|---|-------------|---------------|--------------------|
| 1 | Merge PDF   | `/merge`      | `/api/merge`       |
| 2 | Split PDF   | `/split`      | `/api/split`       |
| 3 | Compress    | `/compress`   | `/api/compress`    |
| 4 | Rotate      | `/rotate`     | `/api/rotate`      |
| 5 | JPG → PDF   | `/jpg-to-pdf` | `/api/jpg-to-pdf`  |
| 6 | PDF → JPG   | `/pdf-to-jpg` | `/api/pdf-to-jpg`  |
| 7 | Watermark   | `/watermark`  | `/api/watermark`   |
| 8 | Protect     | `/protect`    | `/api/protect`     |
| 9 | Unlock      | `/unlock`     | `/api/unlock`      |
| 10| Organize    | `/organize`   | `/api/organize`    |

## Tech stack

- **Next.js 14** App Router + **TypeScript** + **Tailwind CSS v3**
- **pdf-lib** — merge, split, rotate, watermark, organize, JPG→PDF
- **pdfjs-dist** — PDF→JPG (server) and organize thumbnails (client)
- **sharp** — image normalization, JPEG encoding
- **node-qpdf2** — password protect / unlock (uses the `qpdf` binary)
- **canvas** — required by pdfjs-dist's Node build for pixel rendering
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
- PDF→JPG uses pdfjs-dist's Node build with the `canvas` package as the
  pixel backend.
- Protect/Unlock rely on the `qpdf` binary being available
  (`/usr/bin/qpdf` in this environment).
- Files are processed in memory — nothing is written to long-term storage.
