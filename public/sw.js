const CACHE_NAME = 'interpretreflect-v1';
const urlsToCache = [
  '/',
  '/dashboard/mobile',
  '/dashboard/analytics',
  '/dashboard/baseline',
  '/dashboard/quick-reflect',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Activate service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - network first, cache fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseToCache = response.clone();
        
        // Cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Return cached version if network fails
        return caches.match(event.request);
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-quick-checks') {
    event.waitUntil(syncQuickChecks());
  }
});

async function syncQuickChecks() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/offline-quick-checks');
    
    if (response) {
      const offlineData = await response.json();
      
      // Sync each offline check
      for (const check of offlineData) {
        try {
          await fetch('/api/quick-checks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(check),
          });
        } catch (error) {
          console.error('Failed to sync check:', error);
        }
      }
      
      // Clear synced data
      await cache.delete('/offline-quick-checks');
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'New assignment reminder',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('InterpretReflect', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/dashboard/mobile')
  );
});