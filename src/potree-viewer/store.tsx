'use client';

/**
 * Potree Viewer Store
 * Zustand-based state management for the Potree viewer
 */

import { createContext, useContext, useRef, type ReactNode } from 'react';
import { createStore, useStore, type StoreApi } from 'zustand';

import type {
  PotreeViewerState,
  PotreeViewerActions,
  PotreeViewerStore,
} from './types';

// ============================================
// Initial State
// ============================================

const initialState: PotreeViewerState = {
  viewer: null,
  isLoading: false,
  scriptsLoaded: false,
  error: null,
  pointClouds: new Map(),
};

// ============================================
// Store Factory
// ============================================

export const createPotreeStore = (): StoreApi<PotreeViewerStore> => {
  return createStore<PotreeViewerStore>((set, get) => ({
    // State
    ...initialState,

    // Actions
    setViewer: (viewer) => set({ viewer }),

    setLoading: (isLoading) => set({ isLoading }),

    setScriptsLoaded: (scriptsLoaded) => set({ scriptsLoaded }),

    setError: (error) => set({ error }),

    addPointCloud: (name, pointCloud) => {
      const pointClouds = new Map(get().pointClouds);
      pointClouds.set(name, pointCloud);
      set({ pointClouds });
    },

    removePointCloud: (name) => {
      const pointClouds = new Map(get().pointClouds);
      const pc = pointClouds.get(name);
      if (pc && get().viewer) {
        get().viewer?.scene.removePointCloud(pc);
      }
      pointClouds.delete(name);
      set({ pointClouds });
    },

    reset: () => {
      const { viewer } = get();
      if (viewer) {
        // Clean up viewer if needed
      }
      set({
        ...initialState,
        pointClouds: new Map(),
      });
    },
  }));
};

// ============================================
// Context
// ============================================

const PotreeStoreContext = createContext<StoreApi<PotreeViewerStore> | null>(null);

// ============================================
// Provider Component
// ============================================

export interface PotreeProviderProps {
  children: ReactNode;
}

export function PotreeProvider({ children }: PotreeProviderProps) {
  const storeRef = useRef<StoreApi<PotreeViewerStore> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createPotreeStore();
  }

  return (
    <PotreeStoreContext.Provider value={storeRef.current}>
      {children}
    </PotreeStoreContext.Provider>
  );
}

// ============================================
// Hooks
// ============================================

/**
 * Access the Potree store with a selector
 */
export function usePotreeStore<T>(selector: (state: PotreeViewerStore) => T): T {
  const store = useContext(PotreeStoreContext);

  if (!store) {
    throw new Error(
      'usePotreeStore must be used within a PotreeProvider. ' +
      'Make sure to wrap your component tree with <PotreeProvider>.'
    );
  }

  return useStore(store, selector);
}

/**
 * Get the raw store instance (for advanced use cases)
 */
export function usePotreeStoreApi(): StoreApi<PotreeViewerStore> {
  const store = useContext(PotreeStoreContext);

  if (!store) {
    throw new Error(
      'usePotreeStoreApi must be used within a PotreeProvider. ' +
      'Make sure to wrap your component tree with <PotreeProvider>.'
    );
  }

  return store;
}

// ============================================
// Convenience Selectors
// ============================================

export const selectViewer = (state: PotreeViewerStore) => state.viewer;
export const selectIsLoading = (state: PotreeViewerStore) => state.isLoading;
export const selectScriptsLoaded = (state: PotreeViewerStore) => state.scriptsLoaded;
export const selectError = (state: PotreeViewerStore) => state.error;
export const selectPointClouds = (state: PotreeViewerStore) => state.pointClouds;

// ============================================
// Export Types
// ============================================

export type { PotreeViewerStore, PotreeViewerState, PotreeViewerActions };
