// Service Worker for H3 Local Chat PWA
const CACHE_NAME = 'h3chat-v1';
const urlsToCache = [
  '/h3chat/',
  '/h3chat/index.html',
  '/h3chat/manifest.json',
  '/h3chat/icon-192.png',
  '/h3chat/icon-512.png',
  // Vite build assets will be added dynamically
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[SW] Cache install failed:', error);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches  
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip WebSocket and API requests
  if (event.request.url.includes('ws://') || 
      event.request.url.includes('wss://') ||
      event.request.url.includes('api/') ||
      event.request.url.includes('nominatim.openstreetmap.org')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response from cache
        if (response) {
          console.log('[SW] Serving from cache:', event.request.url);
          return response;
        }

        // Clone the request because it's a stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response because it's a stream
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              // Cache successful responses
              if (event.request.url.startsWith(self.location.origin)) {
                console.log('[SW] Caching new resource:', event.request.url);
                cache.put(event.request, responseToCache);
              }
            });

          return response;
        }).catch((error) => {
          console.error('[SW] Fetch failed:', error);
          
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/h3chat/index.html');
          }
          
          throw error;
        });
      })
  );
});

// Background sync for offline messages (future feature)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Could implement offline message queue here
      Promise.resolve()
    );
  }
});

// Push notifications (future feature)
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event.data?.text());
  
  const options = {
    body: event.data?.text() || 'New message in H3 Chat!',
    icon: '/h3chat/icon-192.png',
    badge: '/h3chat/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'h3chat-message',
    data: {
      url: '/h3chat/'
    },
    actions: [
      {
        action: 'open',
        title: 'Open Chat'
      },
      {
        action: 'close', 
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('H3 Local Chat', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/h3chat/')
    );
  }
});