const VERSION = "sera-v4";
const APP_CACHE = `${VERSION}-app`;
const STATE_CACHE = `${VERSION}-state`;
const APP_SHELL = [
  "/",
  "/?source=pwa",
  "/offline.html",
  "/dashboard",
  "/results",
  "/shopping-list",
  "/pricing",
  "/manifest.webmanifest",
  "/pwa-192.png",
  "/pwa-512.png",
  "/maskable-512.png",
  "/apple-touch-icon.png",
];
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
  if (event.data?.type === "SERA_WARM_CACHE") {
    event.waitUntil(caches.open(APP_CACHE).then((cache) => cache.addAll(APP_SHELL)));
    return;
  }

  if (event.data?.type === "SERA_NOTIFICATION") {
    event.waitUntil(
      self.registration.showNotification(event.data.title ?? "Sera", {
        body: event.data.body ?? "Sera",
        icon: "/pwa-192.png",
        badge: "/pwa-192.png",
        data: { url: event.data.url ?? "/dashboard" },
      })
    );
    return;
  }

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

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url ?? "/dashboard", self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const focusedClient = clients.find((client) => client.url === targetUrl);
      if (focusedClient) return focusedClient.focus();
      return self.clients.openWindow(targetUrl);
    })
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

  if (request.mode === "navigate") {
    event.respondWith(
      networkFirstNavigation(request).catch(() =>
        caches.match(request).then((response) => response ?? caches.match("/") ?? caches.match("/offline.html"))
      )
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }
        const copy = response.clone();
        caches.open(APP_CACHE).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then((response) => response ?? caches.match("/")))
  );
});

function networkFirstNavigation(request) {
  return Promise.race([
    fetch(request).then((response) => {
      if (response && response.status === 200) {
        const copy = response.clone();
        caches.open(APP_CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Navigation timeout")), 1800)),
  ]);
}
