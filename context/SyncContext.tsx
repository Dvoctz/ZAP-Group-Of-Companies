import React, { createContext, useContext, ReactNode, useEffect, useCallback } from 'react';
import { getPendingOrders, removeSyncedOrder } from '../utils/indexedDB';
import { supabase } from '../supabaseClient';
import { PendingOrder } from '../types';

interface SyncContextType {
    syncPendingOrders: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    
    const syncPendingOrders = useCallback(async () => {
        if (!navigator.onLine) {
            console.log('Offline, skipping sync.');
            return;
        }

        console.log('Checking for pending orders to sync...');
        const pendingOrders: PendingOrder[] = await getPendingOrders();
        
        if (pendingOrders.length === 0) {
            console.log('No pending orders to sync.');
            return;
        }

        console.log(`Syncing ${pendingOrders.length} pending orders...`);

        for (const order of pendingOrders) {
            const originalClientId = order.clientId;
            // The 'clientId' is only for IndexedDB tracking, don't send it to Supabase.
            const orderPayload = { ...order };
            delete (orderPayload as Partial<PendingOrder>).clientId;

            const { error } = await supabase.from('orders').insert([orderPayload]);

            if (error) {
                console.error('Failed to sync order:', order, 'Error:', error);
                // Continue to the next order, don't clear this one.
            } else {
                console.log('Successfully synced order with client ID:', originalClientId);
                // Remove the successfully synced order from the local queue.
                await removeSyncedOrder(originalClientId);
            }
        }
    }, []);

    useEffect(() => {
        // Attempt to sync on initial app load
        syncPendingOrders();

        // Listen for when the app comes back online
        window.addEventListener('online', syncPendingOrders);
        
        // Listen for messages from the service worker
        const handleServiceWorkerMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'SYNC_ORDERS') {
                console.log('Received SYNC_ORDERS message from service worker.');
                syncPendingOrders();
            }
        };
        
        navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);

        // Cleanup listeners on component unmount
        return () => {
            window.removeEventListener('online', syncPendingOrders);
            navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
        };
    }, [syncPendingOrders]);

    return (
        <SyncContext.Provider value={{ syncPendingOrders }}>
            {children}
        </SyncContext.Provider>
    );
};

export const useSync = () => {
    const context = useContext(SyncContext);
    if (context === undefined) {
        throw new Error('useSync must be used within a SyncProvider');
    }
    return context;
};