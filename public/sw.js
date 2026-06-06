const VERSION = "sera-v1";
const APP_CACHE = `${VERSION}-app`;
const STATE_CACHE = `${VERSION}-state`;
const APP_SHELL = ["/", "/dashboard", "/results", "/shopping-list", "/pricing", "/icon.svg"];
const OFFLINE_STATE_URL = "/offline-state.json";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "SERA_OFFLINE_STATE") {
    return;
  }

  const snapshot = {
    savedAt: new Date().toISOString(),
    activePlan: event.data.activePlan ?? null,
    shoppingItems: event.data.shoppingItems ?? [],
  };

  event.waitUntil(
    caches.open(STATE_CACHE).then((cache) =>
      cache.put(
        OFFLINE_STATE_URL,
        new Response(JSON.stringify(snapshot), {
          headers: { "Content-Type": "application/json; charset=utf-8" },
        })
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.pathname === OFFLINE_STATE_URL) {
    event.respondWith(
      caches.match(OFFLINE_STATE_URL).then(
        (response) =>
          response ??
          new Response(JSON.stringify({ savedAt: null, activePlan: null, shoppingItems: [] }), {
            headers: { "Content-Type": "application/json; charset=utf-8" },
          })
      )
    );
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(APP_CACHE).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then((response) => response ?? caches.match("/")))
  );
});
