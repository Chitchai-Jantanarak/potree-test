'use client';

/**
 * CesiumCanvas - Cesium viewer with camera sync to Potree
 * Uses the container created by parent (cesium_container_{containerId})
 */

import { useEffect, useRef, useMemo, useState } from 'react';
import { usePotreeStore } from '../store';
import { getCesiumBasePath } from '../constants';
import { BASE_PATH, CONTAINER_IDS, DEFAULT_CESIUM_CONFIG } from '../potree.config';
import type { CesiumConfig } from '../types';

interface Props {
  basePath?: string;
  config?: CesiumConfig;
}

// Projection helper - converts UTM to lon/lat using proj4 if available
function createProjection(zone: '47' | '48') {
  // Try to use proj4 if loaded (more accurate)
  const proj4 = (window as { proj4?: unknown }).proj4 as
    | ((from: string, to: string) => { forward: (xy: [number, number]) => [number, number] })
    | undefined;

  if (proj4) {
    try {
      const utmProj = `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs`;
      const wgs84 = '+proj=longlat +datum=WGS84 +no_defs';
      return proj4(utmProj, wgs84);
    } catch {
      // Fall back to simple conversion
    }
  }

  // Simple UTM to WGS84 approximation (fallback)
  const centralMeridian = zone === '47' ? 99 : 105;
  return {
    forward: (xy: [number, number]): [number, number] => {
      const x = xy[0];
      const y = xy[1];
      // Approximate conversion using UTM scale factor
      const k0 = 0.9996;
      const lon = centralMeridian + ((x - 500000) / (k0 * 6378137)) * (180 / Math.PI);
      const lat = (y / (k0 * 6378137)) * (180 / Math.PI);
      return [lon, lat];
    },
  };
}

export function CesiumCanvas({ basePath = BASE_PATH, config = {} }: Props) {
  const cesiumRef = useRef<Cesium.Viewer | null>(null);
  const animationRef = useRef<number | null>(null);
  const initializedRef = useRef(false);
  const [containerReady, setContainerReady] = useState(false);

  const viewer = usePotreeStore((s) => s.viewer);
  const scriptsLoaded = usePotreeStore((s) => s.scriptsLoaded);
  const containerId = usePotreeStore((s) => s.containerId);
  const zone = usePotreeStore((s) => s.zone);
  const offsetZ = usePotreeStore((s) => s.offsetZ);
  const setCesiumViewer = usePotreeStore((s) => s.setCesiumViewer);

  // Use centralized container ID function
  const cesiumContainerId = CONTAINER_IDS.getCesiumId(containerId);

  // Wait for container to be available in DOM
  useEffect(() => {
    if (containerReady) return;

    const checkContainer = () => {
      const container = document.getElementById(cesiumContainerId);
      if (container) {
        setContainerReady(true);
      } else {
        // Retry on next frame
        requestAnimationFrame(checkContainer);
      }
    };

    checkContainer();
  }, [cesiumContainerId, containerReady]);

  // Merge config with defaults
  const mergedConfig = { ...DEFAULT_CESIUM_CONFIG, ...config };

  // Memoize projection to avoid recreation on every render
  const toMap = useMemo(() => createProjection(zone), [zone]);

  // Initialize Cesium when Potree viewer is ready and container exists
  useEffect(() => {
    if (!scriptsLoaded || !viewer || !containerReady) return;
    if (initializedRef.current) return;
    if (!window.Cesium) {
      console.error('Cesium not loaded');
      return;
    }

    const Cesium = window.Cesium;
    const cesiumContainer = document.getElementById(cesiumContainerId);
    if (!cesiumContainer) {
      // Container should exist since containerReady is true
      return;
    }

    try {
      initializedRef.current = true;

      // Configure Cesium base URL
      Cesium.buildModuleUrl.setBaseUrl(getCesiumBasePath(basePath) + '/');

      // Create Cesium viewer with OpenStreetMap imagery (matching reference implementation)
      const cesiumViewer = new Cesium.Viewer(cesiumContainer, {
        useDefaultRenderLoop: false,
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        skyBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        terrainShadows: Cesium.ShadowMode?.DISABLED,
        imageryProvider: Cesium.createOpenStreetMapImageryProvider({
          url: 'https://a.tile.openstreetmap.org/',
        }),
      });

      cesiumRef.current = cesiumViewer;
      setCesiumViewer(cesiumViewer);

      // Set initial view from merged config
      const initialPos = mergedConfig.initialPosition;
      cesiumViewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(initialPos.lon, initialPos.lat, initialPos.height),
      });

      // Check if we have point clouds to sync camera
      const hasPointClouds = () => {
        try {
          return viewer.scene?.pointclouds?.length > 0;
        } catch {
          return false;
        }
      };

      // Camera sync loop - syncs Potree camera to Cesium
      const syncLoop = () => {
        if (!cesiumViewer || cesiumViewer.isDestroyed()) {
          return;
        }

        animationRef.current = requestAnimationFrame(syncLoop);

        try {
          // Only sync camera when there are point clouds loaded
          if (!hasPointClouds()) {
            cesiumViewer.render();
            return;
          }

          const camera = viewer.scene?.getActiveCamera?.();
          if (!camera) {
            cesiumViewer.render();
            return;
          }

          // Get Potree camera position and target
          const pPos = new window.THREE.Vector3(0, 0, 0).applyMatrix4(camera.matrixWorld);
          const pUp = new window.THREE.Vector3(0, 600, 0).applyMatrix4(camera.matrixWorld);
          const pTarget = viewer.scene.view?.getPivot?.() || pPos;

          // Convert to Cesium coordinates
          const toCesium = (pos: THREE.Vector3) => {
            const xy: [number, number] = [pos.x, pos.y];
            const height = pos.z;
            const [lon, lat] = toMap.forward(xy);
            return Cesium.Cartesian3.fromDegrees(lon, lat, height - 30 + offsetZ);
          };

          const cPos = toCesium(pPos);
          const cUpTarget = toCesium(pUp);
          const cTarget = toCesium(pTarget);

          // Calculate direction and up vectors
          let cDir = Cesium.Cartesian3.subtract(cTarget, cPos, new Cesium.Cartesian3());
          let cUp = Cesium.Cartesian3.subtract(cUpTarget, cPos, new Cesium.Cartesian3());
          cDir = Cesium.Cartesian3.normalize(cDir, new Cesium.Cartesian3());
          cUp = Cesium.Cartesian3.normalize(cUp, new Cesium.Cartesian3());

          // Set Cesium camera
          cesiumViewer.camera.setView({
            destination: cPos,
            orientation: { direction: cDir, up: cUp },
          });

          // Sync FOV
          const aspect = camera.aspect;
          const fovy = Math.PI * (camera.fov / 180);

          if (cesiumViewer.camera.frustum instanceof Cesium.PerspectiveFrustum) {
            if (aspect < 1) {
              cesiumViewer.camera.frustum.fov = fovy;
            } else {
              const fovx = Math.atan(Math.tan(0.5 * fovy) * aspect) * 2;
              cesiumViewer.camera.frustum.fov = fovx;
            }
          }

          cesiumViewer.render();
        } catch {
          // Ignore sync errors, still render
          try {
            cesiumViewer.render();
          } catch {
            // Ignore
          }
        }
      };

      animationRef.current = requestAnimationFrame(syncLoop);
    } catch (e) {
      console.error('Cesium initialization error:', e);
      initializedRef.current = false;
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (cesiumRef.current && !cesiumRef.current.isDestroyed()) {
        cesiumRef.current.destroy();
      }
      cesiumRef.current = null;
      initializedRef.current = false;
      setCesiumViewer(null);
    };
  }, [scriptsLoaded, viewer, containerReady, cesiumContainerId, basePath, mergedConfig.mapProvider, mergedConfig.initialPosition, zone, offsetZ, toMap, setCesiumViewer]);

  // This component doesn't render anything - parent creates the container
  return null;
}
