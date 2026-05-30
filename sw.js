// ─────────────────────────────────────────
//  Service Worker
//  CoupleSpend PWA
// ─────────────────────────────────────────

const CACHE_NAME    = 'couplespend-v1';
const STATIC_CACHE  = 'couplespend-static-v1';
const DYNAMIC_CACHE = 'couplespend-dynamic-v1';

// ── Files to cache on install ─────────────
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/app.html',
  '/manifest.json',
  '/css/variables.css',
  '/css/global.css',
  '/css/components.css',
  '/css/login.css',
  '/css/dashboard.css',
  '/css/transactions.css',
  '/css/compare.css',
  '/css/analytics.css',
  '/css/budget.css',
  '/css/settings.css',
  '/js/core/firebase-config.js',
  '/js/core/auth.js',
  '/js/core/store.js',
  '/js/core/router.js',
  '/js/ui/toast.js',
  '/js/ui/modal.js',
  '/js/ui/theme.js',
  '/js/ui/components.js',
  '/js/ui/charts.js',
  '/js/features/transactions.js',
  '/js/features/budget.js',
  '/js/features/compare.js',
  '/js/features/export.js',
  '/js/features/share.js',
  '/js/features/backup.js',
  '/js/pages/dashboard.js',
  '/js/pages/settings.js',
  '/js/pages/transactions-page.js',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png'
];

// ── CDN resources to cache ─────────────────
const CDN_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// ── Install ───────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[SW] Install error:', err);
      })
  );
});

// ── Activate ──────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');

  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys
            .filter(key => {
              return key !== STATIC_CACHE
                  && key !== DYNAMIC_CACHE;
            })
            .map(key => {
              console.log('[SW] Deleting old cache:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activated');
        return self.clients.claim();
      })
  );
});

// ── Fetch ─────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url         = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip Firebase requests (always network)
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('firebase.googleapis.com') ||
    url.hostname.includes('firebaseapp.com') ||
    url.hostname.includes('googleapis.com')
  ) {
    return;
  }

  // Skip Chrome extensions
  if (url.protocol === 'chrome-extension:') return;

  event.respondWith(handleFetch(request));
});

// ── Fetch strategy handler ─────────────────
async function handleFetch(request) {
  const url = new URL(request.url);

  // Strategy: Cache First (for static assets & CDN)
  if (isStaticAsset(url)) {
    return cacheFirst(request);
  }

  // Strategy: Network First (for HTML pages)
  if (request.headers.get('Accept')?.includes('text/html')) {
    return networkFirst(request);
  }

  // Strategy: Stale While Revalidate (for everything else)
  return staleWhileRevalidate(request);
}

// ── Cache First ────────────────────────────
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

  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response('Offline', { status: 503 });
  }
}

// ── Network First ─────────────────────────
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;

  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Return offline page
    const offlinePage = await caches.match('/index.html');
    return offlinePage || new Response(
      '<h1>Offline</h1><p>Please check your connection</p>',
      {
        headers: { 'Content-Type': 'text/html' },
        status:  503
      }
    );
  }
}

// ── Stale While Revalidate ─────────────────
async function staleWhileRevalidate(request) {
  const cache  = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

// ── Is static asset check ──────────────────
function isStaticAsset(url) {
  const staticExts = [
    '.js', '.css', '.png', '.jpg',
    '.jpeg', '.svg', '.woff', '.woff2',
    '.ico', '.webp'
  ];
  return staticExts.some(ext => url.pathname.endsWith(ext))
    || url.hostname.includes('cdn.jsdelivr.net')
    || url.hostname.includes('cdnjs.cloudflare.com')
    || url.hostname.includes('fonts.googleapis.com')
    || url.hostname.includes('fonts.gstatic.com');
}

// ── Push Notifications ─────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: 'CoupleSpend', body: event.data.text() };
  }

  const options = {
    body:    data.body    || data.message || '',
    icon:    data.icon    || '/assets/icons/icon-192.png',
    badge:   data.badge   || '/assets/icons/icon-72.png',
    tag:     data.tag     || 'couplespend',
    data:    data.data    || {},
    actions: data.actions || [],
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'CoupleSpend',
      options
    )
  );
});

// ── Notification click ─────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/app.html';

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(windowClients => {
        // Focus existing window
        for (const client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// ── Background sync ────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncOfflineTransactions());
  }
});

// ── Sync offline transactions ──────────────
async function syncOfflineTransactions() {
  try {
    // Get offline queue from IndexedDB
    const queue = await getOfflineQueue();

    if (!queue || queue.length === 0) return;

    console.log(`[SW] Syncing ${queue.length} offline transactions`);

    // Process each queued transaction
    for (const item of queue) {
      try {
        // Post to sync endpoint or handle via client
        const clients_ = await clients.matchAll();
        clients_.forEach(client => {
          client.postMessage({
            type: 'SYNC_TRANSACTION',
            data: item
          });
        });
      } catch (err) {
        console.error('[SW] Sync item error:', err);
      }
    }

  } catch (err) {
    console.error('[SW] Sync error:', err);
  }
}

// ── Get offline queue (stub) ───────────────
async function getOfflineQueue() {
  // In production: read from IndexedDB
  return [];
}

// ── Message handler ────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data?.type === 'CACHE_URLS') {
    const urls = event.data.urls || [];
    caches.open(DYNAMIC_CACHE)
      .then(cache => cache.addAll(urls))
      .catch(err => console.error('[SW] Cache URLs error:', err));
  }
});

console.log('[SW] Service Worker loaded - CoupleSpend v1');