// Keeps the crisis page usable with no network (hostel Wi-Fi drops, captive portals).
// Scope is intentionally small: precache /crisis and its static assets, and send any
// failed navigation there. Bump CACHE when this file's behaviour changes.
const CACHE = "aatman-crisis-v1";
const CRISIS_URL = "/crisis";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      const res = await fetch(CRISIS_URL, { cache: "reload" });
      if (!res.ok) throw new Error(`Precache of ${CRISIS_URL} failed: ${res.status}`);
      const html = await res.clone().text();
      await cache.put(CRISIS_URL, res);

      // CSS, JS and font files the page references. Excludes `\` so escaped paths in the RSC payload aren't misread.
      const assets = [...new Set(html.match(/\/_next\/static\/[^"'\s)\\]+/g) ?? [])];
      await Promise.allSettled(assets.map((url) => cache.add(url)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key !== CACHE) await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    if (url.pathname === CRISIS_URL) {
      // Network first so helpline updates reach users, cache when offline.
      event.respondWith(
        fetch(request)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((cache) => cache.put(CRISIS_URL, copy));
            }
            return res;
          })
          .catch(async () => (await caches.match(CRISIS_URL)) ?? Response.error()),
      );
      return;
    }
    // Any other page while offline: go to the crisis page rather than a browser error.
    event.respondWith(fetch(request).catch(() => Response.redirect(CRISIS_URL, 302)));
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    // Hashed, immutable assets: cache first.
    event.respondWith(caches.match(request).then((hit) => hit ?? fetch(request)));
  }
});
