const CACHE_NAME = 'packtrack-v1';

// Install event
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(self.clients.claim());
});

// Push notification event
self.addEventListener('push', (event) => {
    console.log('Push received:', event);

    if (!event.data) {
        console.log('No data in push event');
        return;
    }

    let data;
    try {
        data = event.data.json();
    } catch (e) {
        console.error('Failed to parse push data:', e);
        data = {
            title: 'PackTrack',
            body: event.data.text(),
        };
    }

    const tag = data.data?.reminder_id ? 'reminder-' + data.data.reminder_id : 'packtrack-' + Date.now();

    const options = {
        body: data.body || '',
        icon: data.icon || '/icons/icon-192x192.png',
        badge: data.badge || '/icons/badge-72x72.png',
        data: data.data || {},
        actions: data.actions || [
            { action: 'complete', title: '✓ Hecho' },
            { action: 'snooze', title: '⏰ Recordar' }
        ],
        tag: tag,
        renotify: true,
        requireInteraction: true,
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'PackTrack', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event.action);
    event.notification.close();

    const data = event.notification.data || {};

    if (event.action === 'complete') {
        // Send message to client to mark as complete
        event.waitUntil(
            self.clients.matchAll({ type: 'window' }).then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({
                        type: 'COMPLETE_REMINDER',
                        reminder_id: data.reminder_id,
                    });
                });
            })
        );
    } else if (event.action === 'snooze') {
        // Snooze for 10 minutes
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
        const urlToOpen = data.url || '/reminders';

        event.waitUntil(
            self.clients.matchAll({ type: 'window' }).then((clients) => {
                // Check if there's already a window open
                for (const client of clients) {
                    if ('focus' in client) {
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