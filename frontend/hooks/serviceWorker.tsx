'use client';

import { useEffect, useState } from 'react';

export const useServiceWorker = () => {
    const [isReady, setIsReady] = useState(false);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const [updateAvailable, setUpdateAvailable] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
            return;
        }

        const registerSW = async () => {
            try {
                const reg = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/',
                });

                setRegistration(reg);
                setIsReady(true);

                // Check for updates
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                setUpdateAvailable(true);
                            }
                        });
                    }
                });

                // Check for updates periodically
                setInterval(() => {
                    reg.update();
                }, 60 * 60 * 1000); // Every hour
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        };

        registerSW();

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'COMPLETE_REMINDER') {
                // Dispatch custom event for the app to handle
                window.dispatchEvent(new CustomEvent('completeReminder', {
                    detail: { reminderId: event.data.reminder_id }
                }));
            }
        });
    }, []);

    const update = () => {
        if (registration?.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    };

    return {
        isReady,
        registration,
        updateAvailable,
        update,
    };
};