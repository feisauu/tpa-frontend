self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("tpa-cache").then((cache) =>
      cache.addAll([
        "/",
        "/index.html",
        "/bundle.js",
        "/public/images/manifest.json",
        "/public/icons/icon-192x192.png",
        "/public/icons/icon-512x512.png"
      ])
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});