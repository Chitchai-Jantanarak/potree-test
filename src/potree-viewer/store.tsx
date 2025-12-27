"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { createStore, useStore, type StoreApi } from "zustand";
import type { PotreeStoreState, UTMZone, GeoPosition } from "./types";

interface StoreProps {
  containerId?: string;
  zone?: UTMZone;
  offsetZ?: number;
  position?: GeoPosition;
}

function createPotreeStore(props: StoreProps = {}): StoreApi<PotreeStoreState> {
  return createStore<PotreeStoreState>((set) => ({
    viewer: null,
    cesiumViewer: null,
    scriptsLoaded: false,
    containerId: props.containerId ?? "potree_render_area",
    zone: props.zone ?? "10",
    offsetZ: props.offsetZ ?? 0,
    position: props.position ?? null,
    setViewer: (viewer) => set({ viewer }),
    setCesiumViewer: (cesiumViewer) => set({ cesiumViewer }),
    setScriptsLoaded: (scriptsLoaded) => set({ scriptsLoaded }),
  }));
}

const StoreContext = createContext<StoreApi<PotreeStoreState> | null>(null);

interface ProviderProps extends StoreProps {
  children: ReactNode;
}

export function PotreeProvider({
  children,
  containerId,
  zone,
  offsetZ,
  position,
}: ProviderProps): ReactNode {
  const storeRef = useRef<StoreApi<PotreeStoreState> | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createPotreeStore({
      containerId,
      zone,
      offsetZ,
      position,
    });
  }
  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
}

export function usePotreeStore<T>(selector: (state: PotreeStoreState) => T): T {
  const store = useContext(StoreContext);
  if (!store)
    throw new Error("usePotreeStore must be used within PotreeProvider");
  return useStore(store, selector);
}

export function usePotreeStoreApi(): StoreApi<PotreeStoreState> {
  const store = useContext(StoreContext);
  if (!store)
    throw new Error("usePotreeStoreApi must be used within PotreeProvider");
  return store;
}
