'use client';

import { useRef } from 'react';
import { useContext } from 'react';
import { createContext } from 'react';

import { createStore, useStore } from 'zustand';

interface PotreeViewerState {
    containerId: string;
    sidebar: boolean;
    pointBudget: number;
    viewer: Potree.Viewer | null;
    setViewer: (viewer: Potree.Viewer | null) => void;
    potreeLoading: boolean;
    setPotreeLoading: (potreeLoading: boolean) => void;
    togglePotreeLoading: () => void;
    url: string | null;
    setUrl: (url: string) => void;
    zone: '47' | '48';
}

export interface PotreeViewerProps {
    url: string;
    containerId: string;
    sidebar?: boolean;
    pointBudget?: number;
    zone: '47' | '48';
}

const createPotreeViewerStore = (props: PotreeViewerProps) => {
    return createStore<PotreeViewerState>()((set) => ({
        pointBudget: 1_000_000,
        sidebar: false,
        ...props,
        viewer: null,
        setViewer: (viewer: Potree.Viewer | null) => set({ viewer }),
        potreeLoading: false,
        setPotreeLoading: (potreeLoading: boolean) => set({ potreeLoading }),
        togglePotreeLoading: () =>
            set((prev) => ({
                potreeLoading: !prev.potreeLoading,
            })),
        setUrl: (url: string) => set({ url }),
    }));
};

type PotreeViewerStore = ReturnType<typeof createPotreeViewerStore>;
export const PotreeViewerContext = createContext<PotreeViewerStore | null>(
    null
);

type PotreeViewerProviderProps = React.PropsWithChildren<PotreeViewerProps>;
export function PotreeViewerProvider({
    children,
    ...rest
}: PotreeViewerProviderProps) {
    const storeRef = useRef<PotreeViewerStore>(null);
    if (!storeRef.current) {
        storeRef.current = createPotreeViewerStore({
            ...rest,
        });
    }

    return (
        <PotreeViewerContext.Provider value={storeRef.current}>
            {children}
        </PotreeViewerContext.Provider>
    );
}

export function usePotreeViewer<T>(
    selector: (state: PotreeViewerState) => T
): T {
    const store = useContext(PotreeViewerContext);
    if (!store)
        throw new Error('Missing PotreeViewerContext.Provider in the tree');
    return useStore(store, selector);
}
