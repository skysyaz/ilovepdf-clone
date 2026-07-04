/* iLovePDF Clone — Service Worker
 * Caches the app shell so the site loads offline and repeat visits are fast.
 * Network-first for HTML + /api/*, cache-first for static assets + the
 * self-hosted pdf.js worker.
 *
 * Bump CACHE_VERSION when you ship breaking changes so old caches evict.
 */
const CACHE_VERSION = "ilovepdf-v2";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const SHELL_URLS = [
  "/",
  "/merge",
  "/split",
  "/compress",
  "/rotate",
  "/jpg-to-pdf",
  "/pdf-to-jpg",
  "/watermark",
  "/protect",
  "/unlock",
  "/organize",
  "/flatten",
  "/extract-text",
  "/chat",
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  // Self-hosted pdf.js worker — precache so the in-browser tools work offline.
  "/pdf.worker.min.mjs",
];

self.addEventListener("install", (event) => {
  // Cache each URL independently so one 404 doesn't nuke the whole shell.
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await Promise.allSettled(SHELL_URLS.map((u) => cache.add(u)));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((n) => n.startsWith("ilovepdf-") && n !== SHELL_CACHE && n !== RUNTIME_CACHE)
          .map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Never cache API responses — they're per-request and may carry user data.
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(req).catch(
        () =>
          new Response(JSON.stringify({ error: "Offline. API not available." }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          })
      )
    );
    return;
  }

  // Network-first for HTML pages (Next.js routes).
  if (req.mode === "navigate" || req.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() =>
          caches.match(req).then(
            (cached) => cached || caches.match("/offline") || new Response("Offline", { status: 503 })
          )
        )
    );
    return;
  }

  // Cache-first for everything else (static assets, _next chunks, images, worker).
  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
    )
  );
});