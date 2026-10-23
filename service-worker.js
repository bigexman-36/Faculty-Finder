/* Faculty Finder PWA service worker.
   Only the app shell and static library assets are cached. Map tiles and routing
   responses remain network-only to avoid stale directions and excessive storage. */
const CACHE_NAME = "faculty-finder-shell-v1";
const APP_ROOT = new URL("./", self.registration.scope).href;
const INDEX_URL = new URL("index.html", APP_ROOT).href;
const APP_SHELL = [
  APP_ROOT,
  INDEX_URL,
  new URL("manifest.webmanifest", APP_ROOT).href,
  new URL("icons/faculty-finder.svg", APP_ROOT).href
];
const STATIC_ASSETS = [
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js",
  "https://cdn.jsdelivr.net/npm/leaflet-rotate@0.2.8/dist/leaflet-rotate-src.js"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(APP_SHELL.map(url => cache.add(url).catch(() => null)));
    await Promise.all(STATIC_ASSETS.map(url => cache.add(url).catch(() => null)));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("faculty-finder-") && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isStaticLibrary = STATIC_ASSETS.includes(url.href);

  // Map tiles and route APIs are intentionally not cached: stale maps or routes
  // could mislead someone navigating across campus.
  if (url.hostname.includes("tile.openstreetmap.org") ||
      url.hostname.includes("routing.openstreetmap.de")) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        if (response && response.ok) cache.put(INDEX_URL, response.clone());
        return response;
      } catch {
        return (await cache.match(request)) ||
          (await cache.match(INDEX_URL)) ||
          new Response("Faculty Finder is offline. Reconnect to the internet and try again.", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" }
          });
      }
    })());
    return;
  }

  if (url.origin === self.location.origin || isStaticLibrary) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response && (response.ok || response.type === "opaque")) {
          cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      } catch {
        return new Response("", { status: 504, statusText: "Offline" });
      }
    })());
  }
});
