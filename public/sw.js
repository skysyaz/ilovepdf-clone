/* iLovePDF Clone — Service Worker
 * Hand-rolled, tiny (~2 KB). Caches the app shell so the site loads
 * offline and speeds up repeat visits. Network-first for /api/* and
 * /_next/*, cache-first for static assets.
 */
const CACHE_VERSION = "ilovepdf-v1";
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
  "/chat",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/offline",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS).catch(() => {}))
      .then(() => self.skipWaiting())
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

  // Never cache API responses — they're per-request and may contain
  // user data.
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

  // Cache-first for everything else (static assets, _next chunks, images).
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
