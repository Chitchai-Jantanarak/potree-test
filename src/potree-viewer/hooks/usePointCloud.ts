'use client';

/**
 * usePointCloud Hook
 * Manage individual point cloud loading and state
 */

import { useState, useEffect, useCallback } from 'react';
import { usePotreeStore } from '../store';
import {
  DEFAULT_POINT_CLOUD_CONFIG,
  POINT_SIZE_TYPE_MAP,
  POINT_SHAPE_MAP,
} from '../constants';
import type { PointCloudConfig } from '../types';

// ============================================
// Types
// ============================================

export interface UsePointCloudOptions extends PointCloudConfig {
  /** Auto-load when viewer is ready */
  autoLoad?: boolean;
  /** Auto-fit to screen after loading */
  autoFit?: boolean;
}

export interface UsePointCloudReturn {
  /** The loaded point cloud */
  pointCloud: Potree.PointCloudOctree | null;
  /** Loading state */
  isLoading: boolean;
  /** Error if loading failed */
  error: Error | null;
  /** Load the point cloud */
  load: () => Promise<void>;
  /** Unload the point cloud */
  unload: () => void;
  /** Set visibility */
  setVisible: (visible: boolean) => void;
  /** Set opacity */
  setOpacity: (opacity: number) => void;
  /** Set point size */
  setPointSize: (size: number) => void;
  /** Fit camera to this point cloud */
  fitToView: () => void;
}

// ============================================
// Hook
// ============================================

export function usePointCloud(options: UsePointCloudOptions): UsePointCloudReturn {
  const { autoLoad = true, autoFit = true, ...config } = options;

  const [pointCloud, setPointCloud] = useState<Potree.PointCloudOctree | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const viewer = usePotreeStore((s) => s.viewer);
  const scriptsLoaded = usePotreeStore((s) => s.scriptsLoaded);
  const addPointCloud = usePotreeStore((s) => s.addPointCloud);
  const removePointCloud = usePotreeStore((s) => s.removePointCloud);

  const mergedConfig = {
    ...DEFAULT_POINT_CLOUD_CONFIG,
    ...config,
  };

  /**
   * Load the point cloud
   */
  const load = useCallback(async (): Promise<void> => {
    if (!viewer || !window.Potree || !scriptsLoaded) {
      throw new Error('Viewer not ready');
    }

    if (pointCloud) {
      return; // Already loaded
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      try {
        window.Potree.loadPointCloud(
          mergedConfig.url,
          mergedConfig.name,
          (result) => {
            try {
              const { pointcloud } = result;

              // Apply transformations
              if (mergedConfig.position) {
                pointcloud.position.x += mergedConfig.position.x ?? 0;
                pointcloud.position.y += mergedConfig.position.y ?? 0;
                pointcloud.position.z += mergedConfig.position.z ?? 0;
              }

              if (mergedConfig.rotation) {
                pointcloud.rotation.x = mergedConfig.rotation.x ?? 0;
                pointcloud.rotation.y = mergedConfig.rotation.y ?? 0;
                pointcloud.rotation.z = mergedConfig.rotation.z ?? 0;
              }

              if (mergedConfig.scale) {
                pointcloud.scale.x = mergedConfig.scale.x ?? 1;
                pointcloud.scale.y = mergedConfig.scale.y ?? 1;
                pointcloud.scale.z = mergedConfig.scale.z ?? 1;
              }

              pointcloud.visible = mergedConfig.visible;

              // Material settings
              const material = pointcloud.material;
              material.size = mergedConfig.size;
              material.pointSizeType = POINT_SIZE_TYPE_MAP[mergedConfig.sizeType];
              material.shape = POINT_SHAPE_MAP[mergedConfig.shape];
              material.opacity = mergedConfig.opacity;

              // Add to scene
              viewer.scene.addPointCloud(pointcloud);
              addPointCloud(mergedConfig.name, pointcloud);
              setPointCloud(pointcloud);
              setIsLoading(false);

              // Auto fit
              if (autoFit) {
                viewer.fitToScreen();
              }

              resolve();
            } catch (err) {
              const e = err instanceof Error ? err : new Error(String(err));
              setError(e);
              setIsLoading(false);
              reject(e);
            }
          }
        );
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        setIsLoading(false);
        reject(e);
      }
    });
  }, [viewer, scriptsLoaded, pointCloud, mergedConfig, autoFit, addPointCloud]);

  /**
   * Unload the point cloud
   */
  const unload = useCallback(() => {
    if (pointCloud && viewer) {
      viewer.scene.removePointCloud(pointCloud);
      removePointCloud(mergedConfig.name);
      setPointCloud(null);
    }
  }, [pointCloud, viewer, mergedConfig.name, removePointCloud]);

  /**
   * Set visibility
   */
  const setVisible = useCallback(
    (visible: boolean) => {
      if (pointCloud) {
        pointCloud.visible = visible;
      }
    },
    [pointCloud]
  );

  /**
   * Set opacity
   */
  const setOpacity = useCallback(
    (opacity: number) => {
      if (pointCloud) {
        pointCloud.material.opacity = Math.max(0, Math.min(1, opacity));
      }
    },
    [pointCloud]
  );

  /**
   * Set point size
   */
  const setPointSize = useCallback(
    (size: number) => {
      if (pointCloud) {
        pointCloud.material.size = Math.max(0, size);
      }
    },
    [pointCloud]
  );

  /**
   * Fit camera to this point cloud
   */
  const fitToView = useCallback(() => {
    if (pointCloud && viewer) {
      viewer.zoomTo(pointCloud, 1);
    }
  }, [pointCloud, viewer]);

  // Auto-load when viewer is ready
  useEffect(() => {
    if (autoLoad && viewer && scriptsLoaded && !pointCloud && !isLoading) {
      load().catch(console.error);
    }
  }, [autoLoad, viewer, scriptsLoaded, pointCloud, isLoading, load]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pointCloud && viewer) {
        viewer.scene.removePointCloud(pointCloud);
        removePointCloud(mergedConfig.name);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

export default usePointCloud;
