'use client';

/**
 * Potree Store - Zustand store with React Context
 */

import { createContext, useContext, useRef, type ReactNode } from 'react';
import { createStore, useStore, type StoreApi } from 'zustand';
import type { PotreeStore, UTMZone } from './types';

interface StoreInitialProps {
  containerId?: string;
  url?: string;
  zone?: UTMZone;
  offsetZ?: number;
}

const createPotreeStore = (initial: StoreInitialProps = {}) =>
  createStore<PotreeStore>((set) => ({
    // Viewers
    viewer: null,
    cesiumViewer: null,

    // Loading states
    scriptsLoaded: false,
    isLoading: false,
    error: null,

    // Config with defaults
    containerId: initial.containerId || 'potree_render_area',
    url: initial.url || null,
    zone: initial.zone || '47',
    offsetZ: initial.offsetZ || 0,

    // Actions
    setViewer: (viewer) => set({ viewer }),
    setCesiumViewer: (cesiumViewer) => set({ cesiumViewer }),
    setScriptsLoaded: (scriptsLoaded) => set({ scriptsLoaded }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setUrl: (url) => set({ url }),
    setContainerId: (containerId) => set({ containerId }),
    setZone: (zone) => set({ zone }),
    setOffsetZ: (offsetZ) => set({ offsetZ }),
    reset: () =>
      set({
        viewer: null,
        cesiumViewer: null,
        scriptsLoaded: false,
        isLoading: false,
        error: null,
      }),
  }));

const StoreContext = createContext<StoreApi<PotreeStore> | null>(null);

interface PotreeProviderProps extends StoreInitialProps {
  children: ReactNode;
}

export function PotreeProvider({
  children,
  containerId,
  url,
  zone,
  offsetZ,
}: PotreeProviderProps) {
  const storeRef = useRef<StoreApi<PotreeStore> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createPotreeStore({ containerId, url, zone, offsetZ });
  }
  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
}

export function usePotreeStore<T>(selector: (s: PotreeStore) => T): T {
  const store = useContext(StoreContext);
  if (!store) throw new Error('usePotreeStore must be within PotreeProvider');
  return useStore(store, selector);
}

// Direct store access for advanced use cases
export function usePotreeStoreApi() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('usePotreeStoreApi must be within PotreeProvider');
  return store;
}
