// ─────────────────────────────────────────
//  Service Worker
//  CoupleSpend PWA
// ─────────────────────────────────────────

const STATIC_CACHE  = 'couplespend-static-v2';
const DYNAMIC_CACHE = 'couplespend-dynamic-v2';

// ── Files to cache ────────────────────────
const STATIC_ASSETS = [
  './',
  './index.html',
  './app.html',
  './manifest.json',
  './css/variables.css',
  './css/global.css',
  './css/components.css',
  './css/login.css',
  './css/dashboard.css',
  './css/transactions.css',
  './css/compare.css',
  './css/analytics.css',
  './css/budget.css',
  './css/settings.css',
  './js/core/firebase-config.js',
  './js/core/auth.js',
  './js/core/store.js',
  './js/core/router.js',
  './js/ui/toast.js',
  './js/ui/modal.js',
  './js/ui/theme.js',
  './js/ui/components.js',
  './js/ui/charts.js',
  './js/features/transactions.js',
  './js/features/budget.js',
  './js/features/recurring.js',
  './js/features/compare.js',
  './js/features/notifications.js',
  './js/features/export.js',
  './js/features/share.js',
  './js/features/backup.js',
  './js/pages/dashboard.js',
  './js/pages/settings.js',
  './js/pages/transactions-page.js',
  './js/pages/analytics-page.js'
];

// ── Install ───────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Install error:', err))
  );
});

// ── Activate ──────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('firebase.googleapis.com') ||
    url.hostname.includes('firebaseapp.com') ||
    url.hostname.includes('googleapis.com') ||
    url.protocol === 'chrome-extension:'
  ) return;

  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const url = new URL(request.url);

  if (isStaticAsset(url)) {
    return cacheFirst(request);
  }

  if (request.headers.get('Accept')?.includes('text/html')) {
    return networkFirst(request);
  }

  return staleWhileRevalidate(request);
}

async function cacheFirst(request) {
  try {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offlinePage = await caches.match('./index.html');
    return offlinePage || new Response(
      '<h1>Offline</h1><p>Check your connection</p>',
      { headers: { 'Content-Type': 'text/html' }, status: 503 }
    );
  }
}

async function staleWhileRevalidate(request) {
  const cache  = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

function isStaticAsset(url) {
  const exts = [
    '.js', '.css', '.png', '.jpg',
    '.jpeg', '.svg', '.woff', '.woff2',
    '.ico', '.webp'
  ];
  return exts.some(e => url.pathname.endsWith(e))
    || url.hostname.includes('cdn.jsdelivr.net')
    || url.hostname.includes('cdnjs.cloudflare.com')
    || url.hostname.includes('fonts.googleapis.com')
    || url.hostname.includes('fonts.gstatic.com')
    || url.hostname.includes('www.gstatic.com');
}

// ── Push Notifications ─────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data = {};
  try { data = event.data.json(); }
  catch { data = { title: 'CoupleSpend', body: event.data.text() }; }

  event.waitUntil(
    self.registration.showNotification(data.title || 'CoupleSpend', {
      body:    data.body    || '',
      icon:    './assets/icons/icon-192.png',
      badge:   './assets/icons/icon-72.png',
      tag:     'couplespend',
      vibrate: [200, 100, 200]
    })
  );
});

// ── Notification Click ─────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) {
        return clients.openWindow('./app.html');
      }
    })
  );
});

// ── Message Handler ────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] CoupleSpend Service Worker v2 loaded');