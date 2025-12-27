"use client";

import { usePotreeStore } from "../store";
import type { Projection } from "../types";

export interface UsePotreeViewerReturn {
  viewer: Potree.Viewer | null;
  cesiumViewer: Cesium.Viewer | null;
  scriptsLoaded: boolean;
  isReady: boolean;
  containerId: string;
  projection: Projection;
  offsetZ: number;
}

export function usePotreeViewer(): UsePotreeViewerReturn {
  const viewer = usePotreeStore((s) => s.viewer);
  const cesiumViewer = usePotreeStore((s) => s.cesiumViewer);
  const scriptsLoaded = usePotreeStore((s) => s.scriptsLoaded);
  const containerId = usePotreeStore((s) => s.containerId);
  const projection = usePotreeStore((s) => s.projection);
  const offsetZ = usePotreeStore((s) => s.offsetZ);

  return {
    viewer,
    cesiumViewer,
    scriptsLoaded,
    isReady: scriptsLoaded && viewer !== null,
    containerId,
    projection,
    offsetZ,
  };
}
