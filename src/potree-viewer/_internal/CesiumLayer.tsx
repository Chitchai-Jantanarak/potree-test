"use client";

import { useEffect, useRef } from "react";
import { usePotreeStore } from "../store";
import {
  CONTAINER_IDS,
  CESIUM_BASE_PATH,
  DEFAULT_CESIUM_CONFIG,
  MAP_PROVIDERS,
  UTM_ZONES,
  WGS84,
} from "../constants";
import type { CesiumConfig, GeoPosition } from "../types";

interface CesiumLayerProps {
  config: Partial<CesiumConfig>;
  onReady?: (viewer: Potree.Viewer, cesiumViewer: Cesium.Viewer) => void;
}

export function CesiumLayer({ config, onReady }: CesiumLayerProps): null {
  const viewer = usePotreeStore((s) => s.viewer);
  const containerId = usePotreeStore((s) => s.containerId);
  const zone = usePotreeStore((s) => s.zone);
  const offsetZ = usePotreeStore((s) => s.offsetZ);
  const position = usePotreeStore((s) => s.position);
  const setCesiumViewer = usePotreeStore((s) => s.setCesiumViewer);

  const cesiumRef = useRef<Cesium.Viewer | null>(null);
  const animationRef = useRef<number | null>(null);
  const initializedRef = useRef(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const cfg = { ...DEFAULT_CESIUM_CONFIG, ...config };
  const cesiumId = CONTAINER_IDS.cesium(containerId);

  useEffect(() => {
    if (!viewer || typeof window === "undefined" || !window.Cesium) return;
    if (initializedRef.current) return;

    const container = document.getElementById(cesiumId);
    if (!container) {
      const timer = setTimeout(() => {}, 50);
      return () => clearTimeout(timer);
    }

    initializedRef.current = true;
    const Cesium = window.Cesium;
    const THREE = window.THREE;
    const proj4 = window.proj4;

    if (!THREE || !proj4) {
      console.error("[CesiumLayer] THREE or proj4 not loaded");
      return;
    }

    // Patch canvas getContext to add willReadFrequently for 2d contexts
    // This suppresses Cesium's Canvas2D warning
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      options?: CanvasRenderingContext2DSettings,
    ) {
      if (type === "2d") {
        return originalGetContext.call(this, type, {
          ...options,
          willReadFrequently: true,
        });
      }
      return originalGetContext.call(this, type, options);
    } as typeof HTMLCanvasElement.prototype.getContext;

    Cesium.buildModuleUrl.setBaseUrl(`${CESIUM_BASE_PATH}/`);

    const pointcloudProjection = UTM_ZONES[zone].proj4;
    const toMap = proj4(pointcloudProjection, WGS84);

    // Reference position for point cloud placement on globe
    const geoRef: GeoPosition = position || {
      longitude: 0,
      latitude: 0,
      height: 0,
    };
    const hasFixedPosition = position !== null;

    // Point cloud origin cache (updated dynamically in render loop)
    let pcOriginX = 0;
    let pcOriginY = 0;
    let pcOriginZ = 0;
    let pcOriginInitialized = false;

    const mapCfg = MAP_PROVIDERS[cfg.mapProvider || "osm"] || MAP_PROVIDERS.osm;
    let imageryProvider: Cesium.ImageryProvider;

    if (mapCfg.type === "arcgis") {
      imageryProvider = new Cesium.ArcGisMapServerImageryProvider({
        url: mapCfg.url,
      });
    } else if (mapCfg.type === "url") {
      imageryProvider = new Cesium.UrlTemplateImageryProvider({
        url: mapCfg.url,
        maximumLevel: 19,
      });
    } else {
      imageryProvider = Cesium.createOpenStreetMapImageryProvider({
        url: mapCfg.url,
      });
    }

    let credits = document.getElementById("cesium-credits");
    if (!credits) {
      credits = document.createElement("div");
      credits.id = "cesium-credits";
      credits.style.display = "none";
      document.body.appendChild(credits);
    }

    const cesiumViewer = new Cesium.Viewer(container, {
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
      terrainShadows: Cesium.ShadowMode.DISABLED,
      imageryProvider,
      creditContainer: credits,
    });

    cesiumRef.current = cesiumViewer;
    setCesiumViewer(cesiumViewer);

    const loop = (): void => {
      animationRef.current = requestAnimationFrame(loop);

      if (cesiumViewer.isDestroyed()) return;

      const camera = viewer.scene.getActiveCamera();
      if (!camera) {
        cesiumViewer.render();
        return;
      }

      // Update point cloud origin when point cloud is loaded
      if (
        hasFixedPosition &&
        !pcOriginInitialized &&
        viewer.scene.pointclouds.length > 0
      ) {
        const pc = viewer.scene.pointclouds[0];
        const bbox = pc.boundingBox;
        if (bbox) {
          pcOriginX = (bbox.min.x + bbox.max.x) / 2;
          pcOriginY = (bbox.min.y + bbox.max.y) / 2;
          pcOriginZ = bbox.min.z;
          pcOriginInitialized = true;
        }
      }

      const pPos = new THREE.Vector3(0, 0, 0).applyMatrix4(camera.matrixWorld);
      const pUp = new THREE.Vector3(0, 600, 0).applyMatrix4(camera.matrixWorld);
      const pTarget = viewer.scene.view.getPivot();

      const toCes = (pos: THREE.Vector3): Cesium.Cartesian3 | null => {
        if (!isFinite(pos.x) || !isFinite(pos.y) || !isFinite(pos.z)) {
          return null;
        }

        let lon: number;
        let lat: number;
        let height: number;

        if (hasFixedPosition) {
          // Convert local offset to geographic offset
          // 1 degree latitude ~ 111320 meters
          // 1 degree longitude ~ 111320 * cos(lat) meters
          const metersPerDegreeLat = 111320;
          const metersPerDegreeLon =
            111320 * Math.cos((geoRef.latitude * Math.PI) / 180);

          // Calculate offset from point cloud origin
          const offsetX = pos.x - pcOriginX;
          const offsetY = pos.y - pcOriginY;
          const offsetHeight = pos.z - pcOriginZ;

          lon = geoRef.longitude + offsetX / metersPerDegreeLon;
          lat = geoRef.latitude + offsetY / metersPerDegreeLat;
          height = (geoRef.height || 0) + offsetHeight + offsetZ;
        } else {
          // Use UTM projection
          const xy: [number, number] = [pos.x, pos.y];
          const deg = toMap.forward(xy);
          if (!isFinite(deg[0]) || !isFinite(deg[1])) {
            return null;
          }
          lon = deg[0];
          lat = deg[1];
          height = pos.z - 30 + offsetZ;
        }

        if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
          return null;
        }

        return Cesium.Cartesian3.fromDegrees(lon, lat, height);
      };

      const cPos = toCes(pPos);
      const cUpTarget = toCes(pUp);
      const cTarget = toCes(pTarget);

      if (!cPos || !cUpTarget || !cTarget) {
        cesiumViewer.render();
        return;
      }

      let cDir = Cesium.Cartesian3.subtract(
        cTarget,
        cPos,
        new Cesium.Cartesian3(),
      );
      let cUp = Cesium.Cartesian3.subtract(
        cUpTarget,
        cPos,
        new Cesium.Cartesian3(),
      );

      const magSq = (v: { x: number; y: number; z: number }) =>
        v.x * v.x + v.y * v.y + v.z * v.z;
      const dirMag = magSq(
        cDir as unknown as { x: number; y: number; z: number },
      );
      const upMag = magSq(
        cUp as unknown as { x: number; y: number; z: number },
      );
      if (
        !isFinite(dirMag) ||
        !isFinite(upMag) ||
        dirMag < 0.0001 ||
        upMag < 0.0001
      ) {
        cesiumViewer.render();
        return;
      }

      cDir = Cesium.Cartesian3.normalize(cDir, new Cesium.Cartesian3());
      cUp = Cesium.Cartesian3.normalize(cUp, new Cesium.Cartesian3());

      cesiumViewer.camera.setView({
        destination: cPos,
        orientation: { direction: cDir, up: cUp },
      });

      const aspect = camera.aspect;
      const fovy = Math.PI * (camera.fov / 180);
      if (cesiumViewer.camera.frustum instanceof Cesium.PerspectiveFrustum) {
        if (aspect < 1) {
          cesiumViewer.camera.frustum.fov = fovy;
        } else {
          cesiumViewer.camera.frustum.fov =
            Math.atan(Math.tan(0.5 * fovy) * aspect) * 2;
        }
      }

      cesiumViewer.render();
    };

    animationRef.current = requestAnimationFrame(loop);
    onReadyRef.current?.(viewer, cesiumViewer);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (cesiumRef.current && !cesiumRef.current.isDestroyed())
        cesiumRef.current.destroy();
      cesiumRef.current = null;
      setCesiumViewer(null);
      initializedRef.current = false;
    };
  }, [
    viewer,
    cesiumId,
    cfg.mapProvider,
    zone,
    offsetZ,
    position,
    setCesiumViewer,
  ]);

  return null;
}
