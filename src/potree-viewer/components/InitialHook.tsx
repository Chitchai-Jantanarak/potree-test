'use client';

/**
 * InitialHook - Initializes Potree viewer
 * Only runs once when scripts are loaded, uses refs to avoid re-initialization
 */

import { useEffect, useRef } from 'react';
import { usePotreeStore, usePotreeStoreApi } from '../store';
import type { PotreeViewerConfig } from '../types';

interface Props {
  config?: PotreeViewerConfig;
  sidebar?: boolean;
  hasCesium?: boolean;
  onReady?: (viewer: Potree.Viewer, cesiumViewer?: Cesium.Viewer) => void;
}

export function InitialHook({ config = {}, sidebar = false, hasCesium = false, onReady }: Props) {
  const store = usePotreeStoreApi();
  const containerId = usePotreeStore((s) => s.containerId);
  const scriptsLoaded = usePotreeStore((s) => s.scriptsLoaded);
  const cesiumViewer = usePotreeStore((s) => s.cesiumViewer);
  const setViewer = usePotreeStore((s) => s.setViewer);

  // Use refs to avoid re-triggering effect on prop changes
  const configRef = useRef(config);
  const sidebarRef = useRef(sidebar);
  const hasCesiumRef = useRef(hasCesium);
  const onReadyRef = useRef(onReady);
  const initializedRef = useRef(false);
  const onReadyCalledRef = useRef(false);

  // Update refs
  configRef.current = config;
  sidebarRef.current = sidebar;
  hasCesiumRef.current = hasCesium;
  onReadyRef.current = onReady;

  useEffect(() => {
    if (!scriptsLoaded) return;
    if (typeof window === 'undefined' || !window.Potree) return;
    if (initializedRef.current) return;

    const area = document.getElementById(containerId);
    if (!area) {
      console.error('Potree render area not found:', containerId);
      return;
    }

    // Check if already initialized in store
    if (store.getState().viewer !== null) return;

    try {
      initializedRef.current = true;

      const viewer = new window.Potree.Viewer(area);
      const cfg = configRef.current;

      // Apply config
      viewer.setEDLEnabled(cfg.edlEnabled ?? true);
      viewer.setFOV(cfg.fov ?? 60);
      viewer.setPointBudget(cfg.pointBudget ?? 1_000_000);
      viewer.setBackground(cfg.background ?? null);
      viewer.loadSettingsFromURL();

      // Set controls
      const controls = cfg.controls ?? 'orbit';
      if (controls === 'orbit') {
        viewer.setControls(viewer.orbitControls);
      } else if (controls === 'earth') {
        viewer.setControls(viewer.earthControls);
      }

      // Custom toggle sidebar
      viewer.toggleSidebar = () => {
        const renderArea = document.getElementById(containerId);
        if (!renderArea) return;
        const isVisible = renderArea.style.left !== '0px';
        renderArea.style.left = isVisible ? '0px' : '300px';
      };

      viewer.setDescription('');

      // Load sidebar GUI
      if (sidebarRef.current || cfg.showSidebar) {
        // Shift render area to make room for sidebar
        area.style.left = '300px';

        viewer.loadGUI(() => {
          viewer.setLanguage('en');
          // Show tools menus
          try {
            window.$?.('#menu_tools')?.next()?.show();
            window.$?.('#menu_clipping')?.next()?.show();
          } catch {
            // jQuery selectors might fail
          }
        }, `#potree_sidebar_container_${containerId}`);
      }

      setViewer(viewer);

      // Only call onReady immediately if NOT using Cesium
      // When Cesium is enabled, we wait for Cesium to initialize first
      if (!hasCesiumRef.current) {
        onReadyCalledRef.current = true;
        onReadyRef.current?.(viewer);
      }
    } catch (e) {
      console.error('Potree initialization error:', e);
      initializedRef.current = false;
    }

    return () => {
      const v = store.getState().viewer;
      if (v) {
        try {
          const area = document.getElementById(containerId);
          if (area) area.innerHTML = '';
        } catch {
          // Ignore cleanup errors
        }
        setViewer(null);
      }
      initializedRef.current = false;
      onReadyCalledRef.current = false;
    };
  }, [scriptsLoaded, containerId, setViewer, store]);

  // Effect to call onReady when Cesium is ready (if Cesium is enabled)
  useEffect(() => {
    if (!hasCesium) return;
    if (onReadyCalledRef.current) return;

    const viewer = store.getState().viewer;
    if (!viewer || !cesiumViewer) return;

    onReadyCalledRef.current = true;
    onReadyRef.current?.(viewer, cesiumViewer);
  }, [hasCesium, cesiumViewer, store]);

  return null;
}
