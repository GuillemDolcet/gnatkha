import { useState, useCallback, useEffect } from 'react';
import axios from '@/lib/axios';

interface UsePushNotificationsReturn {
    isSupported: boolean;
    permission: NotificationPermission | 'unsupported';
    isSubscribed: boolean;
    isLoading: boolean;
    error: string | null;
    subscribe: () => Promise<boolean>;
    unsubscribe: () => Promise<boolean>;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
    const [isSupported, setIsSupported] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check if push notifications are supported
        const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
        setIsSupported(supported);

        if (supported) {
            setPermission(Notification.permission);
            checkSubscription();
        }
    }, []);

    const checkSubscription = async () => {
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                const subscription = await registration.pushManager.getSubscription();
                setIsSubscribed(!!subscription);
            }
        } catch {
            setIsSubscribed(false);
        }
    };

    const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
        try {
            // Check if already registered
            let registration = await navigator.serviceWorker.getRegistration();

            if (!registration) {
                // Register the service worker
                registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/',
                });
                console.log('Service Worker registered:', registration);
            }

            // Wait for it to be ready
            await navigator.serviceWorker.ready;
            return registration;
        } catch (err) {
            console.error('Service Worker registration failed:', err);
            return null;
        }
    };

    const getVapidPublicKey = async (): Promise<string | null> => {
        try {
            const res = await axios.get('/api/push/vapid-public-key');
            return res.data.publicKey;
        } catch (err) {
            console.error('Failed to get VAPID key:', err);
            return null;
        }
    };

    const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const subscribe = useCallback(async (): Promise<boolean> => {
        if (!isSupported) {
            setError('Push notifications not supported');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Step 1: Request notification permission
            console.log('Requesting notification permission...');
            const permissionResult = await Notification.requestPermission();
            setPermission(permissionResult);

            if (permissionResult !== 'granted') {
                setError('Permission denied');
                setIsLoading(false);
                return false;
            }
            console.log('Permission granted');

            // Step 2: Register service worker
            console.log('Registering service worker...');
            const registration = await registerServiceWorker();
            if (!registration) {
                setError('Failed to register service worker');
                setIsLoading(false);
                return false;
            }
            console.log('Service worker ready');

            // Step 3: Get VAPID public key
            console.log('Getting VAPID key...');
            const vapidPublicKey = await getVapidPublicKey();
            if (!vapidPublicKey) {
                setError('Failed to get VAPID key');
                setIsLoading(false);
                return false;
            }
            console.log('VAPID key received');

            // Step 4: Subscribe to push
            console.log('Subscribing to push...');
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            });
            console.log('Push subscription created:', subscription);

            // Step 5: Send subscription to server
            console.log('Sending subscription to server...');
            const subscriptionJson = subscription.toJSON();
            await axios.post('/api/push/subscribe', {
                endpoint: subscriptionJson.endpoint,
                keys: {
                    p256dh: subscriptionJson.keys?.p256dh,
                    auth: subscriptionJson.keys?.auth,
                },
            });
            console.log('Subscription saved to server');

            setIsSubscribed(true);
            setIsLoading(false);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error('Failed to subscribe to push notifications:', err);
            setError(errorMessage);
            setIsLoading(false);
            return false;
        }
    }, [isSupported]);

    const unsubscribe = useCallback(async (): Promise<boolean> => {
        if (!isSupported) return false;

        setIsLoading(true);
        setError(null);

        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                const subscription = await registration.pushManager.getSubscription();

                if (subscription) {
                    // Unsubscribe from push
                    await subscription.unsubscribe();

                    // Remove from server
                    await axios.post('/api/push/unsubscribe', {
                        endpoint: subscription.endpoint,
                    });
                }
            }

            setIsSubscribed(false);
            setIsLoading(false);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error('Failed to unsubscribe from push notifications:', err);
            setError(errorMessage);
            setIsLoading(false);
            return false;
        }
    }, [isSupported]);

    return {
        isSupported,
        permission,
        isSubscribed,
        isLoading,
        error,
        subscribe,
        unsubscribe,
    };
};