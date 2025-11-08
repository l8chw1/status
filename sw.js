
const CACHE = 'status-json-v1';
const ASSETS = ['icon-192.png','icon-512.png','manifest.webmanifest','sw.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k!==CACHE && caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);

  // Network-first for navigations and JSON
  if (req.mode === 'navigate' || req.destination === 'document' || url.pathname.endsWith('/status.json')) {
    e.respondWith(
      fetch(req).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return resp;
      }).catch(() => caches.match(req))
    );
    return;
  }
  // Cache-first for static assets
  if (ASSETS.includes(url.pathname.split('/').pop())) {
    e.respondWith(caches.match(req).then(r => r || fetch(req)));
    return;
  }
  // Default
  e.respondWith(fetch(req).catch(() => caches.match(req)));
});
