"use client";

import { useEffect, useRef } from "react";
import { usePotreeStore, usePotreeStoreApi } from "../store";
import { DEFAULT_VIEWER_CONFIG } from "../constants";
import type { PotreeViewerConfig } from "../types";

interface ViewerInitializerProps {
  config: Partial<PotreeViewerConfig>;
  sidebar: boolean;
  hasCesium: boolean;
  onReady?: (viewer: Potree.Viewer) => void;
}

export function ViewerInitializer({
  config,
  sidebar,
  hasCesium,
  onReady,
}: ViewerInitializerProps): null {
  const store = usePotreeStoreApi();
  const containerId = usePotreeStore((s) => s.containerId);
  const scriptsLoaded = usePotreeStore((s) => s.scriptsLoaded);
  const setViewer = usePotreeStore((s) => s.setViewer);
  const initializedRef = useRef(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    if (!scriptsLoaded || typeof window === "undefined" || !window.Potree)
      return;
    if (initializedRef.current || store.getState().viewer !== null) return;

    const area = document.getElementById(containerId);
    if (!area) return;

    initializedRef.current = true;

    try {
      const cfg = { ...DEFAULT_VIEWER_CONFIG, ...config };
      const viewer = new window.Potree.Viewer(area);

      viewer.classifications = {
        "2": { visible: true, name: "Ground", color: [0.55, 0.27, 0.07, 1] },
        "3": { visible: true, name: "Natural", color: [0.13, 0.55, 0.13, 1] },
        "6": { visible: true, name: "Building", color: [0.3, 0.5, 0.7, 1] },
      };

      viewer.setEDLEnabled(cfg.edlEnabled);
      viewer.setFOV(cfg.fov);
      viewer.setBackground(cfg.background);
      viewer.setPointBudget(cfg.pointBudget);
      viewer.loadSettingsFromURL();
      viewer.setControls(viewer.orbitControls);
      viewer.setDescription("");

      if (sidebar) viewer.loadGUI(() => {});

      setViewer(viewer);
      if (!hasCesium) onReadyRef.current?.(viewer);
    } catch (err) {
      console.error("[ViewerInitializer]", err);
      initializedRef.current = false;
    }

    return () => {
      initializedRef.current = false;
    };
  }, [
    scriptsLoaded,
    containerId,
    store,
    setViewer,
    sidebar,
    hasCesium,
    config,
  ]);

  return null;
}
