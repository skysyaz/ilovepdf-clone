# iLovePDF Clone

A from-scratch Next.js 14 (App Router) + TypeScript + Tailwind CSS clone of
iLovePDF with **13 PDF tools**, a **chat interface**, **PWA** support, and
**two languages**. Built with real, end-to-end processing — no stubs.

**Live:** [https://ilovepdf-clone.pages.dev](https://ilovepdf-clone.pages.dev) ·
Custom domain: [https://pdf.skysyaz.my](https://pdf.skysyaz.my)

---

## What's in the box

### PDF tools (13)

| # | Tool | Route | Runs on | Output |
|---|------|-------|---------|--------|
| 1 | Merge PDF | `/merge` | Server (Worker) | single PDF |
| 2 | Split PDF | `/split` | Server (Worker) | zip of PDFs |
| 3 | Compress | `/compress` | Server (Worker) | smaller PDF |
| 4 | Rotate | `/rotate` | Server (Worker) | rotated PDF |
| 5 | JPG → PDF | `/jpg-to-pdf` | Server (Worker) | PDF |
| 6 | **PDF → JPG** | `/pdf-to-jpg` | **Browser (pdf.js)** | zip of images |
| 7 | Watermark | `/watermark` | Server (Worker) | watermarked PDF |
| 8 | Protect | `/protect` | Server (Worker) | AES-256 PDF |
| 9 | Unlock | `/unlock` | Server (Worker) | decrypted PDF |
| 10 | Organize | `/organize` | Server (Worker) — thumbnails in browser | reordered PDF |
| 11 | **Flatten form** | `/flatten` | Server (Worker) | static fields |
| 12 | **Extract text** | `/extract-text` | **Browser (pdf.js)** | .txt file |
| 13 | **Chat with PDF** | `/chat` | Client intent matcher | routes you to a tool |

### Chat interface

A floating chat bubble is on every page (bottom-right). Type a plain-English
request and it routes you to the right tool — *no real LLM yet, but the
intent matcher covers the common phrases and marks the rest as "coming soon"
when they'd need an AI backend.*

Example phrases it understands:
- *"Split this PDF into single pages"* → Split
- *"Merge these 3 files"* → Merge
- *"Add a 'Confidential' watermark"* → Watermark
- *"Extract all the text from this PDF"* → Extract text
- *"Compress this PDF"* → Compress
- *"Add a password to this PDF"* → Protect
- *"Convert these images to PDFs"* → JPG to PDF
- *"Restrict this PDF so it can't be printed"* → Protect (with note)
- *"Summarize the last 5 pages"* → "coming soon — needs an AI backend"
- *"Convert this to a Word doc"* → "coming soon — needs heavy converter"

### PWA

- **Manifest** at `/manifest.webmanifest` with maskable icons + 3 PWA shortcuts
- **Service worker** at `/sw.js` — cache-first for static assets,
  network-first for HTML, no caching for API responses
- **Install prompt** in the navbar (Chrome / Edge / Android)
- **Offline page** at `/offline` for when nothing is cached

### Themes

- **Light** / **Dark** / **System** — toggle in the navbar
- Class-based Tailwind `dark:` variants, no flash on first paint (inline
  script in `<head>` sets the class before React mounts)
- Persists in `localStorage`

### i18n

- `next-intl` 4.x with two locales: **English** (`/`) and **Bahasa Melayu** (`/ms/`)
- `localePrefix: "as-needed"` — English has no URL prefix
- Middleware redirects unknown locales to default
- Language switcher in the navbar (URL-aware — preserves the current page)
- Add a third locale: add to `i18n/request.ts` + `messages/<code>.json`

---

## Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript** + **Tailwind v3**
- **`@opennextjs/cloudflare`** — adapter for Cloudflare Workers
- **pdf-lib** — merge, split, rotate, watermark, organize, jpg-to-pdf, flatten
- **pdfjs-dist** — PDF→JPG and Extract text (both render in the browser)
- **`@pdfsmaller/pdf-encrypt`** + **`@pdfsmaller/pdf-decrypt`** — AES-256 protect/unlock
  (pure JS / Web Crypto, no native binaries — works on any serverless host)
- **`next-intl`** — i18n
- **react-dropzone** + **@dnd-kit** + **jszip** + **file-saver** — UI
- **Sharp** is kept as a dev dep (unused at runtime on Workers)

---

## Develop

```bash
cd /workspace/ilovepdf
npm install --legacy-peer-deps
npm run dev          # http://localhost:3000
npm run build        # production build (Next.js)
npm run build:cf     # production build for Cloudflare Workers
```

## Deploy

```bash
export CLOUDFLARE_API_TOKEN=...   # needs: workers:edit, account:read
npm run deploy
```

Adds the custom domain `pdf.skysyaz.my` (already configured via the
Custom Domains API) automatically on every deploy.

---

## API contract

All endpoints accept `multipart/form-data`:

- `files` (1 or more, repeated) — the source file(s)
- tool-specific fields (`pages`, `angle`, `password`, `text`, `pageOrder`, …)

Single-PDF tools return `application/pdf` with
`Content-Disposition: attachment; filename="…"`. Multi-file tools (Split,
PDF→JPG) return `application/zip`. Errors return `{ "error": "…" }` as JSON
with a 4xx/5xx status.

---

## Roadmap

What's done in **Phase 1** (this release):
- ✅ All 13 PDF tools
- ✅ Chat shell with intent matcher
- ✅ PWA (manifest, service worker, install prompt, offline page)
- ✅ Dark / light / system theme
- ✅ i18n (English + Bahasa Melayu)

What's **next** (need API keys / bigger budget):
- **Phase 2 — real AI chat:** plug an OpenAI / Anthropic key into the
  chat backend for summarization, translation, semantic page search
- **Phase 3 — OCR:** add a Tesseract.js client-side OCR tool (will push
  bundle to ~15 MB, will need its own dedicated worker or Pages Functions)
- **Phase 4 — Studio editor:** visual page editor with drag-and-drop
  annotations, text overlay, image insertion
- **Phase 5 — Converters:** PDF↔Word / PDF↔Excel / PDF↔PPT round-trip
  (heavy libs, possibly a dedicated backend service)
- **Phase 6 — PDF/X export + CMYK color profiles** (needs Ghostscript)

## Build & size

```
handler.mjs (gzip):    ~1.0 MB  (at the Cloudflare Workers free-tier
                                 1 MB limit — the deploy goes through,
                                 upgrade to Paid if you see 1101 throttling)
middleware (gzip):     ~72 KB
```

## Notes / limitations

- pdf-lib's "compression" is a lossless re-save with stripped metadata and
  packed object streams; it does not re-encode embedded JPEGs/PNGs.
- PDF→JPG and Extract text render entirely in the browser with pdf.js.
- Protect/Unlock use pure-JS Web Crypto (no `qpdf` binary required).
- Files are processed in memory — nothing is written to long-term storage.

## License

MIT
