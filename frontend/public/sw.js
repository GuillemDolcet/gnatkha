/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'packtrack-v1';
const OFFLINE_URL = '/offline';

// Assets to cache
const PRECACHE_ASSETS = [
    '/',
    '/offline',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip API requests
    if (event.request.url.includes('/api/')) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache successful responses
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Return from cache or offline page
                return caches.match(event.request).then((response) => {
                    return response || caches.match(OFFLINE_URL);
                });
            })
    );
});

// Push notification event
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();

    const options: NotificationOptions = {
        body: data.body,
        icon: data.icon || '/icons/icon-192x192.png',
        badge: data.badge || '/icons/badge-72x72.png',
        data: data.data,
        actions: data.actions,
        tag: data.data?.reminder_id ? `reminder-${data.data.reminder_id}` : undefined,
        renotify: true,
        requireInteraction: true,
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const data = event.notification.data;

    if (event.action === 'complete') {
        // Mark as complete - could send to API
        event.waitUntil(
            self.clients.matchAll({ type: 'window' }).then((clients) => {
                // If there's an open window, send message to it
                for (const client of clients) {
                    client.postMessage({
                        type: 'COMPLETE_REMINDER',
                        reminder_id: data?.reminder_id,
                    });
                }
            })
        );
    } else if (event.action === 'snooze') {
        // Snooze for 10 minutes - re-show notification
        event.waitUntil(
            new Promise((resolve) => {
                setTimeout(() => {
                    self.registration.showNotification(
                        event.notification.title,
                        {
                            body: event.notification.body,
                            icon: event.notification.icon,
                            badge: event.notification.badge,
                            data: event.notification.data,
                            tag: event.notification.tag,
                        }
                    ).then(resolve);
                }, 10 * 60 * 1000); // 10 minutes
            })
        );
    } else {
        // Default action - open the app
        const urlToOpen = data?.url || '/dashboard';

        event.waitUntil(
            self.clients.matchAll({ type: 'window' }).then((clients) => {
                // Check if there's already a window open
                for (const client of clients) {
                    if (client.url.includes(urlToOpen) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Open new window
                if (self.clients.openWindow) {
                    return self.clients.openWindow(urlToOpen);
                }
            })
        );
    }
});

export {};