const CACHE_NAME = "gracioustec-cache-v1";

const APP_FILES = [
  "/",
  "/index.html",
  "/manifest.json"
];

// Install the service worker.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_FILES);
    })
  );

  self.skipWaiting();
});

// Activate the service worker.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith("gracioustec-cache-"))
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );

  self.clients.claim();
});

// Handle requests for the public homepage only.
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // Do not cache account, payment, or identity-service pages.
  const privatePages =
    /^\/(login|register|dashboard|profile|transactions|fund-wallet|nin|bvn|nin-verification|bvn-verification|nin-slip)(\.html)?\/?$/i;

  if (privatePages.test(url.pathname)) {
    return;
  }

  // Only handle the public homepage and manifest.
  if (!APP_FILES.includes(url.pathname)) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, copy);
          });
        }

        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
          return cachedResponse;
        }

        return new Response(
          "You are offline. Please connect to the internet and try again.",
          {
            status: 503,
            headers: {
              "Content-Type": "text/plain; charset=utf-8"
            }
          }
        );
      })
  );
});