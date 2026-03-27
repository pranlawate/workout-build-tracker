const CACHE_VERSION = 'build-tracker-v107';
const VIDEO_CACHE = 'build-tracker-videos-v1';
const CACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './css/achievements.css',
  './css/analytics.css',
  './css/components.css',
  './css/deload-modal.css',
  './css/edit-entry-modal.css',
  './css/exercise-detail.css',
  './css/exercise-progressions.css',
  './css/export-import.css',
  './css/history-screen.css',
  './css/main.css',
  './css/number-overlay.css',
  './css/optional-fifth-day.css',
  './css/post-set-feedback.css',
  './css/pre-post-workout-modals.css',
  './css/progress-chart.css',
  './css/progress-dashboard.css',
  './css/progressive-disclosure.css',
  './css/recovery-modal.css',
  './css/screens.css',
  './css/sticky-input.css',
  './css/summary-screen.css',
  './css/unlock-notifications.css',
  './css/video-modal.css',
  './css/warm-up-protocols.css',
  './css/warm-up.css',
  './css/workout-reference.css',
  './css/workout-screen.css',
  './js/app.js',
  './js/components/progress-chart.js',
  './js/components/weight-trend-chart.js',
  './js/modals/edit-entry-modal.js',
  './js/modules/achievements.js',
  './js/modules/analytics-calculator.js',
  './js/modules/barbell-progression-tracker.js',
  './js/modules/body-weight.js',
  './js/modules/complexity-tiers.js',
  './js/modules/deload.js',
  './js/modules/exercise-metadata.js',
  './js/modules/exercise-videos.js',
  './js/modules/form-cues.js',
  './js/modules/optional-fifth-day.js',
  './js/modules/performance-analyzer.js',
  './js/modules/phase-manager.js',
  './js/modules/progression-pathways.js',
  './js/modules/progression.js',
  './js/modules/progress-analyzer.js',
  './js/modules/rotation-manager.js',
  './js/modules/smart-progression.js',
  './js/modules/storage.js',
  './js/modules/stretching-protocols.js',
  './js/modules/tempo-guidance.js',
  './js/modules/unlock-criteria.js',
  './js/modules/unlock-evaluator.js',
  './js/modules/warm-up-protocols.js',
  './js/modules/workout-manager.js',
  './js/modules/workouts.js',
  './js/screens/exercise-detail.js',
  './js/screens/exercise-library.js',
  './js/screens/history-list.js',
  './js/utils/export-import.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(CACHE_VERSION)
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
          cacheNames.map((cacheName) => {
            // Keep current caches
            if (cacheName === CACHE_VERSION || cacheName === VIDEO_CACHE) {
              return null;
            }

            // Delete old caches
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Runtime caching for videos (handles both /videos/ and /repo-name/videos/)
  if (url.pathname.includes('/videos/')) {
    event.respondWith(
      caches.open(VIDEO_CACHE).then(cache => {
        return cache.match(event.request).then(response => {
          // Return cached video if available (instant playback)
          if (response) {
            console.log('[SW] Serving video from cache:', url.pathname);
            return response;
          }

          // Otherwise fetch and cache for next time
          console.log('[SW] Fetching and caching video:', url.pathname);
          return fetch(event.request).then(networkResponse => {
            // Only cache successful responses
            if (networkResponse && networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(error => {
            console.error('[SW] Video fetch failed:', url.pathname, error);
            // Let error bubble to video.onerror handler
            throw error;
          });
        });
      })
    );
    return;
  }

  // Network-first strategy: always get fresh code when online, fall back to cache when offline
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
          return networkResponse;
        }

        if (networkResponse.ok) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_VERSION)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }

        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
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
