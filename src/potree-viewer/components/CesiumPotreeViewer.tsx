'use client';

/**
 * CesiumPotreeViewer - Cesium globe with Potree overlay and sidebar
 */

import { useEffect, useRef, type CSSProperties } from 'react';
import { PotreeLoader } from './PotreeLoader';
import { usePotreeStore } from '../store';
import {
  DEFAULT_BASE_PATH,
  getCesiumBasePath,
  MAP_PROVIDERS,
  type MapProvider,
} from '../constants';
import type { PotreeViewerConfig, PointCloudConfig } from '../types';

interface Position {
  lon: number;
  lat: number;
  height: number;
}

interface Props {
  basePath?: string;
  mapProvider?: MapProvider;
  initialPosition?: Position;
  config?: PotreeViewerConfig;
  pointClouds?: PointCloudConfig[];
  className?: string;
  style?: CSSProperties;
  onReady?: (cesiumViewer: Cesium.Viewer, potreeViewer: Potree.Viewer) => void;
  onError?: (error: Error) => void;
}

// Unique ID generator
let idCounter = 0;
const genId = (prefix: string) => `${prefix}_${++idCounter}_${Date.now()}`;

export function CesiumPotreeViewer({
  basePath = DEFAULT_BASE_PATH,
  mapProvider = 'osm',
  initialPosition = { lon: 0, lat: 0, height: 10000000 },
  config = {},
  pointClouds = [],
  className,
  style,
  onReady,
  onError,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cesiumRef = useRef<Cesium.Viewer | null>(null);
  const potreeRef = useRef<Potree.Viewer | null>(null);
  const initedRef = useRef(false);
  const idsRef = useRef({
    cesium: genId('cesium'),
    potree: genId('potree'),
  });

  const scriptsLoaded = usePotreeStore((s) => s.scriptsLoaded);
  const setViewer = usePotreeStore((s) => s.setViewer);

  // Initialize Cesium and Potree
  useEffect(() => {
    if (!scriptsLoaded || initedRef.current) return;
    if (!window.Cesium || !window.Potree) {
      console.error('Cesium or Potree not loaded');
      return;
    }

    const cesiumContainer = document.getElementById(idsRef.current.cesium);
    const potreeContainer = document.getElementById(idsRef.current.potree);
    if (!cesiumContainer || !potreeContainer) {
      console.error('Containers not found');
      return;
    }

    initedRef.current = true;

    try {
      const Cesium = window.Cesium;
      const Potree = window.Potree;

      // === CESIUM SETUP ===
      Cesium.buildModuleUrl.setBaseUrl(getCesiumBasePath(basePath) + '/');

      const provider = MAP_PROVIDERS[mapProvider];
      let imageryProvider: Cesium.ImageryProvider;

      if (provider.type === 'osm') {
        imageryProvider = new Cesium.UrlTemplateImageryProvider({
          url: provider.url + '{z}/{x}/{y}.png',
          maximumLevel: 19,
        });
      } else {
        imageryProvider = new Cesium.ArcGisMapServerImageryProvider({
          url: provider.url,
        });
      }

      const cesiumViewer = new Cesium.Viewer(cesiumContainer, {
        imageryProvider,
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
        vrButton: false,
        infoBox: false,
        selectionIndicator: false,
        creditContainer: document.createElement('div'),
      });

      cesiumRef.current = cesiumViewer;

      cesiumViewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(
          initialPosition.lon,
          initialPosition.lat,
          initialPosition.height
        ),
      });

      // === POTREE SETUP ===
      const potreeViewer = new Potree.Viewer(potreeContainer);
      potreeRef.current = potreeViewer;

      // Configure Potree
      potreeViewer.setEDLEnabled(config.edlEnabled ?? true);
      potreeViewer.setFOV(config.fov ?? 60);
      potreeViewer.setPointBudget(config.pointBudget ?? 1000000);
      potreeViewer.setBackground(null); // Transparent for Cesium overlay

      // Use Earth controls for globe navigation
      potreeViewer.setControls(potreeViewer.earthControls);

      // Load Potree GUI with sidebar
      if (config.showGUI !== false) {
        potreeViewer.loadGUI(() => {
          potreeViewer.setLanguage('en');
          // Show tools menus
          window.$?.('#menu_tools')?.next()?.show();
          window.$?.('#menu_clipping')?.next()?.show();

          if (config.showSidebar === false) {
            potreeViewer.toggleSidebar();
          }
        });
      }

      setViewer(potreeViewer);

      // Load point clouds
      pointClouds.forEach((pc) => {
        Potree.loadPointCloud(pc.url, pc.name, (result) => {
          const cloud = result.pointcloud;
          if (pc.position) {
            cloud.position.set(
              pc.position.x ?? 0,
              pc.position.y ?? 0,
              pc.position.z ?? 0
            );
          }
          if (pc.visible !== undefined) cloud.visible = pc.visible;
          potreeViewer.scene.addPointCloud(cloud);
        });
      });

      // Notify ready
      requestAnimationFrame(() => {
        onReady?.(cesiumViewer, potreeViewer);
      });

    } catch (e) {
      console.error('Initialization error:', e);
      onError?.(e instanceof Error ? e : new Error(String(e)));
    }

    // Cleanup
    return () => {
      if (cesiumRef.current) {
        cesiumRef.current.destroy();
        cesiumRef.current = null;
      }
      if (potreeRef.current) {
        const container = document.getElementById(idsRef.current.potree);
        if (container) container.innerHTML = '';
        potreeRef.current = null;
      }
      initedRef.current = false;
      setViewer(null);
    };
  }, [scriptsLoaded, basePath, mapProvider, initialPosition, config, pointClouds, onReady, onError, setViewer]);

  // const containerStyle: CSSProperties = {
  //   position: 'relative',
  //   width: '100%',
  //   height: '100%',
  //   ...style,
  // };

  // const layerStyle: CSSProperties = {
  //   position: 'absolute',
  //   top: 0,
  //   left: 0,
  //   right: 0,
  //   bottom: 0,
  // };

  return (
    <PotreeLoader basePath={basePath} includeCesium>
      <div ref={containerRef} className={className} >
        {/* Cesium layer (bottom) */}
        <div id={idsRef.current.cesium} />
        {/* Potree layer (top, transparent background) */}
        <div id={idsRef.current.potree} />
      </div>
    </PotreeLoader>
  );
}
