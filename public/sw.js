// SwamiGPT's service worker: lets installed SwamiGPT open pages you've visited without a
// connection, and shows a calm offline page otherwise. Answers, voice and sign-in always need the
// network, so /api is never cached.
const VERSION = "v1";
const PAGES = `pages-${VERSION}`;
const ASSETS = `assets-${VERSION}`;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(PAGES).then((c) => c.addAll(["/offline", "/pwa-icon/192.png"])));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => ![PAGES, ASSETS].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  // Pages: fresh from the network when possible, the saved copy when offline
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) caches.open(PAGES).then((c) => c.put(req, res.clone()));
          return res;
        })
        .catch(async () => (await caches.match(req)) ?? (await caches.match("/offline"))),
    );
    return;
  }

  // Built files never change once published, and the mantra recordings rarely do
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/audio/") || url.pathname.startsWith("/pwa-icon/")) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ??
          fetch(req).then((res) => {
            if (res.ok) caches.open(ASSETS).then((c) => c.put(req, res.clone()));
            return res;
          }),
      ),
    );
  }
});
