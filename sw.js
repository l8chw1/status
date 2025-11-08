// v3 — network-first, no-cache for JSON, instant activation
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });

// 네트워크 우선. status.json은 항상 최신본.
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // status.json은 무조건 네트워크 + no-store
  if (url.pathname.endsWith('/status.json')) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  // HTML도 네트워크 우선. 실패 시 캐시/기본으로.
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(() => fetch(event.request))
    );
    return;
  }

  // 그 외 정적 리소스는 브라우저 기본 정책
});
