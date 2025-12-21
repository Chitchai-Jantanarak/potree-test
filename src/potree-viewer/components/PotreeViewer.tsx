'use client';

/**
 * PotreeViewer - Main Potree viewer component
 */

import { useEffect, useRef, type ReactNode, type CSSProperties } from 'react';
import { usePotreeStore } from '../store';
import type { PotreeViewerConfig, PointCloudConfig } from '../types';

interface Props {
  config?: PotreeViewerConfig;
  pointClouds?: PointCloudConfig[];
  className?: string;
  style?: CSSProperties;
  includeCesium?: boolean;
  onReady?: (viewer: Potree.Viewer) => void;
  onError?: (error: Error) => void;
  children?: ReactNode;
}

// Unique ID generator
let idCounter = 0;
const genId = () => `potree_${++idCounter}_${Date.now()}`;

export function PotreeViewer({
  config = {},
  pointClouds = [],
  className,
  style,
  includeCesium = false,
  onReady,
  onError,
  children,
}: Props) {
  const renderAreaRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Potree.Viewer | null>(null);
  const initedRef = useRef(false);
  const idsRef = useRef({ render: genId(), sidebar: genId(), cesium: genId() });

  const scriptsLoaded = usePotreeStore((s) => s.scriptsLoaded);
  const setViewer = usePotreeStore((s) => s.setViewer);

  // Initialize viewer
  useEffect(() => {
    if (!scriptsLoaded || !renderAreaRef.current) return;
    if (!window.Potree) return;

    // Prevent double initialization in React Strict Mode
    if (initedRef.current) return;
    initedRef.current = true;

    // Small delay to ensure DOM is ready
    const initTimeout = setTimeout(() => {
      if (!renderAreaRef.current) return;

      try {
        const viewer = new window.Potree.Viewer(renderAreaRef.current);
        viewerRef.current = viewer;

      // Apply config
      const c = config;
      if (c.fov) viewer.setFOV(c.fov);
      if (c.pointBudget) viewer.setPointBudget(c.pointBudget);
      if (c.background !== undefined) viewer.setBackground(c.background);
      if (c.edlEnabled !== undefined) viewer.setEDLEnabled(c.edlEnabled);
      if (c.edlRadius) viewer.setEDLRadius(c.edlRadius);
      if (c.edlStrength) viewer.setEDLStrength(c.edlStrength);

      viewer.loadSettingsFromURL();

      // Set controls (skip if using Cesium - Cesium handles navigation)
      if (!includeCesium) {
        viewer.setControls(viewer.earthControls);
      }

      // Load GUI
      if (c.showGUI !== false) {
        viewer.loadGUI(() => {
          viewer.setLanguage('en');
          // Show tools menus
          window.$?.('#menu_tools')?.next()?.show();
          window.$?.('#menu_clipping')?.next()?.show();
          // Toggle sidebar if needed
          if (c.showSidebar === false) {
            viewer.toggleSidebar();
          }
        });
      }

      setViewer(viewer);

      // Load point clouds
      pointClouds.forEach((pc) => {
        window.Potree.loadPointCloud(pc.url, pc.name, (result) => {
          const cloud = result.pointcloud;

          if (pc.position) {
            cloud.position.x = pc.position.x ?? 0;
            cloud.position.y = pc.position.y ?? 0;
            cloud.position.z = pc.position.z ?? 0;
          }
          if (pc.visible !== undefined) cloud.visible = pc.visible;

          viewer.scene.addPointCloud(cloud);
          viewer.fitToScreen();
        });
      });

        // Defer onReady to allow Potree to fully initialize
        requestAnimationFrame(() => {
          onReady?.(viewer);
        });
      } catch (e) {
        onError?.(e instanceof Error ? e : new Error(String(e)));
      }
    }, 0);

    // Cleanup
    return () => {
      clearTimeout(initTimeout);

      // Clear render area
      if (renderAreaRef.current) {
        renderAreaRef.current.innerHTML = '';
      }
      // Clear sidebar
      const sidebar = document.getElementById(idsRef.current.sidebar);
      if (sidebar) sidebar.innerHTML = '';

      viewerRef.current = null;
      initedRef.current = false;
      setViewer(null);
    };
  }, [scriptsLoaded, config, pointClouds, includeCesium, onReady, onError, setViewer]);

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    ...style,
  };

  const renderAreaStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    zIndex: includeCesium ? 1 : 0,
  };

  const cesiumStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
  };

  return (
    <div className={className} style={containerStyle}>
      {/* Cesium container (behind Potree) */}
      {includeCesium && (
        <div id={idsRef.current.cesium} style={cesiumStyle} />
      )}

      {/* Potree render area */}
      <div ref={renderAreaRef} id={idsRef.current.render} style={renderAreaStyle}>
        {children}
      </div>

      {/* Sidebar container */}
      <div id={idsRef.current.sidebar} />
    </div>
  );
}

// Export the cesium container ID getter for CesiumViewer
export function usePotreeIds() {
  const idsRef = useRef({ render: genId(), sidebar: genId(), cesium: genId() });
  return idsRef.current;
}
