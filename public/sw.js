const CACHE_NAME = 'door-knocking-v1';
const TILE_CACHE = 'map-tiles-v1';

const APP_SHELL = [
  '/door-knocking',
  '/door-knocking/lead/new',
  '/door-knocking/map',
];

// Install: cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL).catch(() => {}))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== TILE_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for tiles
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Map tiles: cache-first with long TTL
  if (url.hostname.includes('tile.openstreetmap.org') || url.hostname.includes('unpkg.com/leaflet')) {
    event.respondWith(
      caches.open(TILE_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request)
            .then((res) => {
              if (res.ok) cache.put(request, res.clone());
              return res;
            })
            .catch(() => new Response('', { status: 503 }));
        })
      )
    );
    return;
  }

  // API routes: network-first, queue offline
  if (url.pathname.startsWith('/api/door-knocking/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: 'offline', cached: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
    return;
  }

  // Navigation: network-first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((cached) => cached || caches.match('/door-knocking'))
      )
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((res) => {
      if (res.ok && request.method === 'GET') {
        caches.open(CACHE_NAME).then((c) => c.put(request, res.clone()));
      }
      return res;
    }))
  );
});

// Background sync for offline saves (when supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-leads') {
    event.waitUntil(syncLeads());
  }
});

async function syncLeads() {
  // Sync logic handled by the app via IndexedDB; service worker just triggers
  const clients = await self.clients.matchAll();
  clients.forEach((client) => client.postMessage({ type: 'sync-leads' }));
}
