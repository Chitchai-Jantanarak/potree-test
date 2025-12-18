'use client';

/**
 * usePotreeViewer Hook
 * Provides convenient access to the Potree viewer and common operations
 */

import { useCallback } from 'react';
import { usePotreeStore } from '../store';
import {
  DEFAULT_POINT_CLOUD_CONFIG,
  POINT_SIZE_TYPE_MAP,
  POINT_SHAPE_MAP,
} from '../constants';
import type { PointCloudConfig, PotreeViewerConfig, UsePotreeViewerReturn } from '../types';

/**
 * Hook to access and control the Potree viewer
 */
export function usePotreeViewer(): UsePotreeViewerReturn {
  const viewer = usePotreeStore((s) => s.viewer);
  const isLoading = usePotreeStore((s) => s.isLoading);
  const scriptsLoaded = usePotreeStore((s) => s.scriptsLoaded);
  const error = usePotreeStore((s) => s.error);
  const pointClouds = usePotreeStore((s) => s.pointClouds);
  const addPointCloud = usePotreeStore((s) => s.addPointCloud);

  /**
   * Load a point cloud into the viewer
   */
  const loadPointCloud = useCallback(
    async (config: PointCloudConfig): Promise<Potree.LoadPointCloudResult> => {
      if (!viewer || !window.Potree) {
        throw new Error('Viewer not initialized');
      }

      const mergedConfig = {
        ...DEFAULT_POINT_CLOUD_CONFIG,
        ...config,
      };

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

                resolve(result);
              } catch (err) {
                reject(err);
              }
            }
          );
        } catch (err) {
          reject(err);
        }
      });
    },
    [viewer, addPointCloud]
  );

  /**
   * Get a loaded point cloud by name
   */
  const getPointCloud = useCallback(
    (name: string): Potree.PointCloudOctree | undefined => {
      return pointClouds.get(name);
    },
    [pointClouds]
  );

  /**
   * Fit camera to view all point clouds
   */
  const fitToScreen = useCallback(() => {
    viewer?.fitToScreen();
  }, [viewer]);

  /**
   * Set viewer background
   */
  const setBackground = useCallback(
    (bg: PotreeViewerConfig['background']) => {
      viewer?.setBackground(bg ?? null);
    },
    [viewer]
  );

  /**
   * Toggle sidebar visibility
   */
  const toggleSidebar = useCallback(() => {
    viewer?.toggleSidebar();
  }, [viewer]);

  return {
    viewer,
    isLoading,
    scriptsLoaded,
    error,
    loadPointCloud,
    getPointCloud,
    fitToScreen,
    setBackground,
    toggleSidebar,
  };
}

export default usePotreeViewer;
