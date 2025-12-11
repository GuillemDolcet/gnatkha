'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useServiceWorker } from '@/hooks/serviceWorker';

interface ServiceWorkerContextType {
    isReady: boolean;
    updateAvailable: boolean;
    update: () => void;
}

const ServiceWorkerContext = createContext<ServiceWorkerContextType>({
    isReady: false,
    updateAvailable: false,
    update: () => {},
});

export const useServiceWorkerContext = () => useContext(ServiceWorkerContext);

interface ServiceWorkerProviderProps {
    children: ReactNode;
}

export function ServiceWorkerProvider({ children }: ServiceWorkerProviderProps) {
    const { isReady, updateAvailable, update } = useServiceWorker();

    return (
        <ServiceWorkerContext.Provider value={{ isReady, updateAvailable, update }}>
            {children}
        </ServiceWorkerContext.Provider>
    );
}