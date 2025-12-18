'use client';

/**
 * PotreeViewer Component
 * Main component that initializes and manages the Potree viewer
 */

import {
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { usePotreeStore } from '../store';
import { PotreeContainer } from './PotreeContainer';
import {
  DEFAULT_VIEWER_CONFIG,
  DEFAULT_POINT_CLOUD_CONFIG,
  POINT_SIZE_TYPE_MAP,
  POINT_SHAPE_MAP,
  CONTROL_TYPE_MAP,
} from '../constants';
import type { PotreeViewerConfig, PointCloudConfig } from '../types';

// ============================================
// Types
// ============================================

export interface PotreeViewerProps {
  /** Viewer configuration */
  config?: PotreeViewerConfig;
  /** Point clouds to load initially */
  pointClouds?: PointCloudConfig[];
  /** Render area element ID */
  renderAreaId?: string;
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Include Cesium integration container */
  includeCesium?: boolean;
  /** Callback when viewer is ready */
  onReady?: (viewer: Potree.Viewer) => void;
  /** Callback when point cloud is loaded */
  onPointCloudLoaded?: (name: string, result: Potree.LoadPointCloudResult) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Children rendered inside the container */
  children?: ReactNode;
}

// ============================================
// Component
// ============================================

export function PotreeViewer({
  config = {},
  pointClouds = [],
  renderAreaId = 'potree_render_area',
  className,
  style,
  includeCesium = false,
  onReady,
  onPointCloudLoaded,
  onError,
  children,
}: PotreeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Potree.Viewer | null>(null);
  const initRef = useRef(false);

  const scriptsLoaded = usePotreeStore((s) => s.scriptsLoaded);
  const setViewer = usePotreeStore((s) => s.setViewer);
  const addPointCloud = usePotreeStore((s) => s.addPointCloud);
  const setError = usePotreeStore((s) => s.setError);

  // Merge config with defaults
  const mergedConfig: Required<PotreeViewerConfig> = {
    ...DEFAULT_VIEWER_CONFIG,
    ...config,
  };

  /**
   * Load a single point cloud
   */
  const loadPointCloud = useCallback(
    async (pcConfig: PointCloudConfig): Promise<void> => {
      if (!viewerRef.current || !window.Potree) {
        throw new Error('Viewer not initialized');
      }

      const viewer = viewerRef.current;

      const mergedPcConfig = {
        ...DEFAULT_POINT_CLOUD_CONFIG,
        ...pcConfig,
      };

      return new Promise((resolve, reject) => {
        try {
          window.Potree.loadPointCloud(
            mergedPcConfig.url,
            mergedPcConfig.name,
            (result) => {
              try {
                const { pointcloud } = result;

                // Apply position offset
                if (mergedPcConfig.position) {
                  pointcloud.position.x += mergedPcConfig.position.x ?? 0;
                  pointcloud.position.y += mergedPcConfig.position.y ?? 0;
                  pointcloud.position.z += mergedPcConfig.position.z ?? 0;
                }

                // Apply rotation
                if (mergedPcConfig.rotation) {
                  pointcloud.rotation.x = mergedPcConfig.rotation.x ?? 0;
                  pointcloud.rotation.y = mergedPcConfig.rotation.y ?? 0;
                  pointcloud.rotation.z = mergedPcConfig.rotation.z ?? 0;
                }

                // Apply scale
                if (mergedPcConfig.scale) {
                  pointcloud.scale.x = mergedPcConfig.scale.x ?? 1;
                  pointcloud.scale.y = mergedPcConfig.scale.y ?? 1;
                  pointcloud.scale.z = mergedPcConfig.scale.z ?? 1;
                }

                // Apply visibility
                pointcloud.visible = mergedPcConfig.visible;

                // Configure material
                const material = pointcloud.material;
                material.size = mergedPcConfig.size;
                material.pointSizeType = POINT_SIZE_TYPE_MAP[mergedPcConfig.sizeType];
                material.shape = POINT_SHAPE_MAP[mergedPcConfig.shape];
                material.opacity = mergedPcConfig.opacity;

                // Add to scene
                viewer.scene.addPointCloud(pointcloud);

                // Track in store
                addPointCloud(mergedPcConfig.name, pointcloud);

                // Callback
                onPointCloudLoaded?.(mergedPcConfig.name, result);

                resolve();
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
    [addPointCloud, onPointCloudLoaded]
  );

  /**
   * Initialize the Potree viewer
   */
  const initializeViewer = useCallback(async () => {
    if (initRef.current || !scriptsLoaded || typeof window === 'undefined') {
      return;
    }

    const renderArea = document.getElementById(renderAreaId);
    if (!renderArea) {
      const error = new Error(`Render area element not found: ${renderAreaId}`);
      setError(error);
      onError?.(error);
      return;
    }

    // Check if already rendered
    if (renderArea.getAttribute('data-potree-render') === 'true') {
      return;
    }

    try {
      initRef.current = true;

      // Create viewer instance
      const viewer = new window.Potree.Viewer(renderArea);
      viewerRef.current = viewer;

      // Apply configuration
      viewer.setEDLEnabled(mergedConfig.edlEnabled);
      if (mergedConfig.edlEnabled) {
        viewer.setEDLRadius(mergedConfig.edlRadius);
        viewer.setEDLStrength(mergedConfig.edlStrength);
      }
      viewer.setFOV(mergedConfig.fov);
      viewer.setPointBudget(mergedConfig.pointBudget);
      viewer.setBackground(mergedConfig.background);
      viewer.loadSettingsFromURL();

      // Set controls
      const controlsKey = CONTROL_TYPE_MAP[mergedConfig.controls];
      viewer.setControls(viewer[controlsKey]);

      // Load GUI if enabled
      if (mergedConfig.showGUI) {
        viewer.loadGUI(() => {
          viewer.setLanguage(mergedConfig.language);

          // Show common menu sections
          if (typeof window.$ !== 'undefined') {
            window.$('#menu_tools').next().show();
            window.$('#menu_clipping').next().show();
          }

          // Toggle sidebar if needed
          if (!mergedConfig.showSidebar) {
            viewer.toggleSidebar();
          }
        });
      }

      // Mark as rendered
      renderArea.setAttribute('data-potree-render', 'true');

      // Update store
      setViewer(viewer);

      // Load initial point clouds
      for (const pcConfig of pointClouds) {
        try {
          await loadPointCloud(pcConfig);
        } catch (err) {
          console.error(`Failed to load point cloud: ${pcConfig.name}`, err);
          onError?.(err instanceof Error ? err : new Error(String(err)));
        }
      }

      // Fit to screen after loading
      if (pointClouds.length > 0) {
        viewer.fitToScreen();
      }

      // Notify ready
      onReady?.(viewer);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      initRef.current = false;
    }
  }, [
    scriptsLoaded,
    renderAreaId,
    mergedConfig,
    pointClouds,
    loadPointCloud,
    setViewer,
    setError,
    onReady,
    onError,
  ]);

  // Initialize when scripts are loaded
  useEffect(() => {
    if (scriptsLoaded) {
      initializeViewer();
    }
  }, [scriptsLoaded, initializeViewer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (viewerRef.current) {
        // Potree doesn't have a built-in destroy method, but we can clean up
        viewerRef.current = null;
        setViewer(null);
      }
    };
  }, [setViewer]);

  return (
    <PotreeContainer
      ref={containerRef}
      renderAreaId={renderAreaId}
      className={className}
      style={style}
      includeCesium={includeCesium}
    >
      {children}
    </PotreeContainer>
  );
}

export default PotreeViewer;
