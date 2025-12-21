'use client';

/**
 * Potree Viewer Hooks
 */

import { useCallback, useState, useEffect } from 'react';
import { usePotreeStore } from '../store';

/**
 * Hook to access the Potree and Cesium viewer instances
 */
export function usePotreeViewer() {
  const viewer = usePotreeStore((s) => s.viewer);
  const cesiumViewer = usePotreeStore((s) => s.cesiumViewer);
  const scriptsLoaded = usePotreeStore((s) => s.scriptsLoaded);
  const isLoading = usePotreeStore((s) => s.isLoading);
  const error = usePotreeStore((s) => s.error);
  const url = usePotreeStore((s) => s.url);
  const containerId = usePotreeStore((s) => s.containerId);
  const zone = usePotreeStore((s) => s.zone);
  const offsetZ = usePotreeStore((s) => s.offsetZ);

  return {
    // Viewers
    viewer,
    cesiumViewer,

    // State
    scriptsLoaded,
    isLoading,
    error,
    isReady: !!viewer,

    // Config
    url,
    containerId,
    zone,
    offsetZ,
  };
}

/**
 * Hook for loading and controlling a point cloud
 */
interface UsePointCloudOptions {
  url: string;
  name: string;
  autoLoad?: boolean;
  autoFit?: boolean;
}

export function usePointCloud({ url, name, autoLoad = true, autoFit = false }: UsePointCloudOptions) {
  const viewer = usePotreeStore((s) => s.viewer);
  const [pointCloud, setPointCloud] = useState<Potree.PointCloudOctree | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(() => {
    if (!viewer || !window.Potree || pointCloud) return;

    setIsLoading(true);
    setError(null);

    try {
      window.Potree.loadPointCloud(url, name, (result) => {
        const cloud = result.pointcloud;
        viewer.scene.addPointCloud(cloud);
        setPointCloud(cloud);
        setIsLoading(false);

        if (autoFit) {
          viewer.fitToScreen();
        }
      });
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setIsLoading(false);
    }
  }, [viewer, url, name, pointCloud, autoFit]);

  const unload = useCallback(() => {
    if (!viewer || !pointCloud) return;
    viewer.scene.removePointCloud(pointCloud);
    setPointCloud(null);
  }, [viewer, pointCloud]);

  const setVisible = useCallback(
    (visible: boolean) => {
      if (pointCloud) pointCloud.visible = visible;
    },
    [pointCloud]
  );

  const setOpacity = useCallback(
    (opacity: number) => {
      if (pointCloud?.material) pointCloud.material.opacity = opacity;
    },
    [pointCloud]
  );

  const setPointSize = useCallback(
    (size: number) => {
      if (pointCloud?.material) pointCloud.material.size = size;
    },
    [pointCloud]
  );

  const fitToView = useCallback(() => {
    if (viewer) viewer.fitToScreen();
  }, [viewer]);

  // Auto-load if enabled
  useEffect(() => {
    if (autoLoad && viewer && !pointCloud && !isLoading) {
      load();
    }
  }, [autoLoad, viewer, pointCloud, isLoading, load]);

  return {
    pointCloud,
    isLoading,
    error,
    load,
    unload,
    setVisible,
    setOpacity,
    setPointSize,
    fitToView,
  };
}

/**
 * Hook for Cesium controls (when using CesiumPotreeViewer or cesium config)
 */
export function useCesiumPotree(cesiumViewerOverride?: Cesium.Viewer | null) {
  const cesiumViewerFromStore = usePotreeStore((s) => s.cesiumViewer);
  const cesiumViewer = cesiumViewerOverride ?? cesiumViewerFromStore;

  const flyTo = useCallback(
    (lon: number, lat: number, height: number, duration = 2) => {
      if (!cesiumViewer || !window.Cesium) return;

      const Cesium = window.Cesium;
      cesiumViewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
        duration,
      });
    },
    [cesiumViewer]
  );

  const setGlobeVisible = useCallback(
    (visible: boolean) => {
      if (!cesiumViewer) return;
      cesiumViewer.scene.globe.show = visible;
    },
    [cesiumViewer]
  );

  const zoomIn = useCallback(
    (amount = 0.5) => {
      if (!cesiumViewer) return;
      cesiumViewer.camera.zoomIn(cesiumViewer.camera.positionCartographic.height * amount);
    },
    [cesiumViewer]
  );

  const zoomOut = useCallback(
    (amount = 0.5) => {
      if (!cesiumViewer) return;
      cesiumViewer.camera.zoomOut(cesiumViewer.camera.positionCartographic.height * amount);
    },
    [cesiumViewer]
  );

  return {
    cesiumViewer,
    flyTo,
    setGlobeVisible,
    zoomIn,
    zoomOut,
    isReady: !!cesiumViewer,
  };
}
