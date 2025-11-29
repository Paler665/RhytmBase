const CACHE = "rb-cache-v5";

// Daftar file wajib (precache)
const PRECACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png"
];

// Install: cache file penting
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// Activate: hapus cache lama
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: strategy = Dynamic Cache + SPA Fallback
self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);

  // Jika navigation (React Router), fallback ke index.html
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Untuk asset dan API: cache-first, lalu dynamic cache
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;

      return fetch(req)
        .then(resp => {
          // jangan cache request Chrome extensions, atau opaque errors
          if (!resp || resp.status >= 400 || req.url.startsWith("chrome-extension")) {
            return resp;
          }

          // simpan ke dynamic cache
          return caches.open(CACHE).then(cache => {
            cache.put(req, resp.clone());
            return resp;
          });
        })
        .catch(() => {
          // fallback opsional: gambar default atau apapun
          return caches.match("/index.html");
        });
    })
  );
});
