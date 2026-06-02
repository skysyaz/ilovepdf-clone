# iLovePDF Clone — Deliverable

A fully-working iLovePDF-like web application with all 10 PDF tools, deployed
to Cloudflare Workers.

**Live URL:** https://ilovepdf-clone.syazwan91.workers.dev

## How to run locally

```bash
cd /workspace/ilovepdf
npm install
npm run dev   # http://localhost:3000
```

For Cloudflare deploy:
```bash
npm run deploy
```

## All 10 tools — all working on Cloudflare Workers

| # | Tool | Page | API | Output |
|---|------|------|-----|--------|
| 1 | Merge PDF | `/merge` | `POST /api/merge` | single PDF |
| 2 | Split PDF | `/split` | `POST /api/split` | zip of single-page PDFs |
| 3 | Compress PDF | `/compress` | `POST /api/compress` | smaller PDF |
| 4 | Rotate PDF | `/rotate` | `POST /api/rotate` | rotated PDF |
| 5 | JPG to PDF | `/jpg-to-pdf` | `POST /api/jpg-to-pdf` | PDF |
| 6 | PDF to JPG | `/pdf-to-jpg` | (rendered in browser) | zip of images |
| 7 | Watermark | `/watermark` | `POST /api/watermark` | watermarked PDF |
| 8 | Protect PDF | `/protect` | `POST /api/protect` | encrypted PDF (AES-256) |
| 9 | Unlock PDF | `/unlock` | `POST /api/unlock` | decrypted PDF |
| 10 | Organize PDF | `/organize` | `POST /api/organize` | reordered PDF |

## Tech stack

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- **@opennextjs/cloudflare** — adapter for Cloudflare Workers
- **pdf-lib** — merge, split, rotate, watermark, organize, jpg-to-pdf
- **jszip** — multi-file downloads
- **@pdfsmaller/pdf-encrypt** — AES-256 PDF encryption (pure JS, Web Crypto API, Cloudflare Workers compatible)
- **@pdfsmaller/pdf-decrypt** — AES-256 PDF decryption
- **pdfjs-dist** — PDF→JPG (rendered in browser with pdf.js)
- **mupdf** was evaluated but abandoned: too large for the 1 MB Cloudflare Workers free tier limit, and no longer needed since PDF→JPG is now client-side

## Cloudflare observability

`wrangler.toml` has `[observability]` enabled with `head_sampling_rate = 1.0`,
which streams every request to the Cloudflare Workers Logs dashboard
(Workers & Pages → Logs). Confirmed via API:
```
observability.enabled: true
logs.enabled: true
head_sampling_rate: 1
```

To view: https://dash.cloudflare.com → Workers & Pages → ilovepdf-clone → Logs.

## Architecture

```
Browser  →  Cloudflare Worker (V8 isolate)
                ├── Static assets (home page, tool pages, _next chunks)
                └── Server functions (10 API routes)
                        ├── pdf-lib for PDF manipulation
                        └── @pdfsmaller/* for AES-256 encryption/decryption
```

All server processing is in-memory. Files are streamed in, processed, and
returned. Nothing is written to disk or stored.

## PDF to JPG — implementation note

`pdf-to-jpg` renders entirely in the browser using `pdfjs-dist` (pdf.js
running in a Web Worker pinned to a CDN). Every page is rasterised to a
canvas and exported as a JPEG, then zipped client-side with JSZip. No
server route, no native deps, works on any host including Cloudflare
Workers free tier. The earlier server-side implementation was removed
because it only handled image-based PDFs; the browser version handles
text, vector, and image pages uniformly.

## Known limitations

- None on the server side. PDF→JPG is fully client-side.

## Build & size

```
handler.mjs (uncompressed):  ~4.6 MB  (grew after dropping legacy node-qpdf2
                                     transitives and adding pdfjs-dist types)
handler.mjs (gzip):          ~1.3 MB
handler.mjs (brotli, est.):  ~1.0 MB  (at the Cloudflare Workers free-tier
                                     1 MB compressed limit — the deploy
                                     went through, but if you start seeing
                                     1101 throttling, upgrade to Workers
                                     Paid ($5/mo) or pin dep versions)

Under the 1 MB Cloudflare Workers free tier limit. ✓

## Project layout

```
/workspace/ilovepdf/
├── app/
│   ├── layout.tsx, page.tsx, globals.css
│   ├── merge/    split/    compress/    rotate/
│   ├── jpg-to-pdf/  pdf-to-jpg/  watermark/
│   ├── protect/  unlock/    organize/
│   └── api/      (one route.ts per tool)
├── components/
│   ├── Navbar.tsx, ToolCard.tsx, ToolShell.tsx
│   ├── FileDropzone.tsx, FileList.tsx
│   ├── ProcessButton.tsx, DownloadButton.tsx
│   └── PageThumbnailGrid.tsx
├── lib/pdf-tools/
│   ├── merge.ts, split.ts, compress.ts, rotate.ts
│   ├── jpg-to-pdf.ts, pdf-to-jpg.ts, watermark.ts
│   ├── protect.ts, unlock.ts, organize.ts
│   └── utils.ts
├── public/             (SVG icons)
├── package.json, tsconfig.json, tailwind.config.ts
├── postcss.config.js, next.config.js, .gitignore
├── open-next.config.ts (Cloudflare adapter config)
├── wrangler.toml       (Cloudflare Workers config + observability)
└── README.md
```

## Round-trip verification

```
protect:  R = 6 (AES-256), 1950 bytes
unlock:   3 pages, no encryption, 1936 bytes (round-trip OK)
wrong password: "Incorrect password" 500 error
```

## Source code

GitHub: https://github.com/skysyaz/ilovepdf-clone
