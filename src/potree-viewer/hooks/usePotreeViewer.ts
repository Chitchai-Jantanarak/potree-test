"use client";

import { usePotreeStore } from "../store";

export interface UsePotreeViewerReturn {
  viewer: Potree.Viewer | null;
  cesiumViewer: Cesium.Viewer | null;
  scriptsLoaded: boolean;
  isReady: boolean;
  containerId: string;
  zone: string;
  offsetZ: number;
}

export function usePotreeViewer(): UsePotreeViewerReturn {
  const viewer = usePotreeStore((s) => s.viewer);
  const cesiumViewer = usePotreeStore((s) => s.cesiumViewer);
  const scriptsLoaded = usePotreeStore((s) => s.scriptsLoaded);
  const containerId = usePotreeStore((s) => s.containerId);
  const zone = usePotreeStore((s) => s.zone);
  const offsetZ = usePotreeStore((s) => s.offsetZ);

  return {
    viewer,
    cesiumViewer,
    scriptsLoaded,
    isReady: scriptsLoaded && viewer !== null,
    containerId,
    zone,
    offsetZ,
  };
}
