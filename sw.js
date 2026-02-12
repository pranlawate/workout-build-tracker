const CACHE_NAME = 'build-tracker-v42';
const CACHE_URLS = [
  './',
  './index.html',
  './css/main.css',
  './css/components.css',
  './css/screens.css',
  './css/workout-screen.css',
  './css/progress-dashboard.css',
  './css/summary-screen.css',
  './css/recovery-modal.css',
  './css/analytics.css',
  './css/workout-reference.css',
  './css/unlock-notifications.css',
  './css/exercise-progressions.css',
  './css/warm-up-protocols.css',
  './css/optional-fifth-day.css',
  './js/app.js',
  './js/modules/storage.js',
  './js/modules/workouts.js',
  './js/modules/progression.js',
  './js/modules/workout-manager.js',
  './js/modules/progress-analyzer.js',
  './js/modules/body-weight.js',
  './js/modules/analytics-calculator.js',
  './js/modules/progression-pathways.js',
  './js/modules/complexity-tiers.js',
  './js/modules/equipment-profiles.js',
  './js/modules/unlock-evaluator.js',
  './js/modules/warm-up-protocols.js',
  './js/modules/optional-fifth-day.js',
  './js/components/weight-trend-chart.js',
  './manifest.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker: Install complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Install failed', error);
        // Still skip waiting even if caching fails partially
        // This allows the SW to activate and try again later
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cache);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return cached response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Don't cache non-GET requests or external URLs
            if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
              return networkResponse;
            }

            // Clone the response (can only be consumed once)
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(() => {
            // Network failed and not in cache
            // Could return a custom offline page here
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  // Validate that message is from a client we control
  if (!event.source) return;

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
