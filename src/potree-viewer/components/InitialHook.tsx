'use client';

/**
 * InitialHook - Initializes Potree viewer
 * Only runs once when scripts are loaded, uses refs to avoid re-initialization
 */

import { useEffect, useRef } from 'react';
import { usePotreeStore, usePotreeStoreApi } from '../store';
import { DEFAULT_VIEWER_CONFIG, CONTAINER_IDS } from '../potree.config';
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
      const cfg = { ...DEFAULT_VIEWER_CONFIG, ...configRef.current };

      // Apply config from centralized defaults
      viewer.setEDLEnabled(cfg.edlEnabled);
      viewer.setFOV(cfg.fov);
      viewer.setPointBudget(cfg.pointBudget);
      viewer.setBackground(cfg.background);

      // Apply EDL settings if provided
      if (cfg.edlRadius) viewer.setEDLRadius(cfg.edlRadius);
      if (cfg.edlStrength) viewer.setEDLStrength(cfg.edlStrength);

      viewer.loadSettingsFromURL();

      // Set controls - use earth controls when Cesium is active
      const controls = hasCesiumRef.current ? 'earth' : (cfg.controls ?? 'earth');
      if (controls === 'orbit') {
        viewer.setControls(viewer.orbitControls);
      } else if (controls === 'earth') {
        viewer.setControls(viewer.earthControls);
      } else if (controls === 'fly') {
        viewer.setControls(viewer.fpControls);
      }

      // Custom toggle sidebar - matching reference implementation pattern
      // Uses the render area left position to toggle sidebar visibility
      viewer.toggleSidebar = () => {
        const renderArea = document.getElementById(containerId);
        if (!renderArea) return;
        const isVisible = renderArea.style.left !== '0px';
        renderArea.style.left = isVisible ? '0px' : '300px';
      };

      viewer.setDescription('');

      // Load sidebar GUI
      // NOTE: Potree's loadGUI is HARDCODED to use '#potree_sidebar_container'
      // It ignores any custom selector parameter
      if (sidebarRef.current || cfg.showSidebar) {
        viewer.loadGUI(() => {
          viewer.setLanguage('en');
          // Show tools menus after GUI loads
          try {
            window.$?.('#menu_tools')?.next()?.show();
            window.$?.('#menu_clipping')?.next()?.show();
          } catch {
            // jQuery selectors might fail
          }
        });
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
