// Service Worker - sw.js
const CACHE_NAME = 'rota-buzios-v1';
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install - precache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate - cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch - cache-first for assets, network-first for navigation requests
self.addEventListener('fetch', event => {
  const request = event.request;

  // For navigation requests (HTML pages) try network first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Put a copy in cache
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then(resp => resp || caches.match('./index.html')))
    );
    return;
  }

  // For other requests (CSS, JS, images) use cache-first
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        // Only cache successful responses
        if (!response || response.status !== 200 || response.type === 'opaque') return response;
        const respClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, respClone));
        return response;
      }).catch(() => {
        // Optional: return a fallback image for image requests
        if (request.destination === 'image') {
          return caches.match('./icon-192.png');
        }
      });
    })
  );
});

// Optional: listen for skipWaiting message to update SW immediately
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});