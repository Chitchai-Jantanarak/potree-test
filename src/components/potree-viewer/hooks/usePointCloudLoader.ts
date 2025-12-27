"use client";

import { useState, useCallback, useRef } from "react";
import { usePotreeStore } from "../store";

export interface PointCloudSource {
  id: string;
  name: string;
  url: string;
}

export interface PointCloudMaterialOptions {
  size?: number;
  pointSizeType?: "fixed" | "adaptive" | "attenuated";
  shape?: "square" | "circle" | "paraboloid";
  activeAttributeName?: string;
}

export interface LoadedPointCloud {
  id: string;
  name: string;
  pointcloud: Potree.PointCloudOctree;
  center: { x: number; y: number; z: number };
  size: number;
}

export interface UsePointCloudLoaderReturn {
  pointClouds: Map<string, LoadedPointCloud>;
  loadingStates: Record<string, boolean>;
  loadPointCloud: (
    source: PointCloudSource,
    options?: PointCloudMaterialOptions,
  ) => Promise<LoadedPointCloud | null>;
  loadPointClouds: (
    sources: PointCloudSource[],
    options?: PointCloudMaterialOptions,
  ) => Promise<void>;
  flyTo: (id: string, factor?: number, duration?: number) => void;
  fitAll: () => void;
  getPointCloud: (id: string) => LoadedPointCloud | undefined;
}

const DEFAULT_MATERIAL_OPTIONS: PointCloudMaterialOptions = {
  size: 0.6,
  pointSizeType: "adaptive",
  shape: "square",
  activeAttributeName: "elevation",
};

function getPointSizeType(type: string): number {
  const Potree = window.Potree;
  if (!Potree) return 2;
  switch (type) {
    case "fixed":
      return Potree.PointSizeType.FIXED;
    case "attenuated":
      return Potree.PointSizeType.ATTENUATED;
    default:
      return Potree.PointSizeType.ADAPTIVE;
  }
}

function getPointShape(shape: string): number {
  const Potree = window.Potree;
  if (!Potree) return 0;
  switch (shape) {
    case "circle":
      return Potree.PointShape.CIRCLE;
    case "paraboloid":
      return Potree.PointShape.PARABOLOID;
    default:
      return Potree.PointShape.SQUARE;
  }
}

export function usePointCloudLoader(): UsePointCloudLoaderReturn {
  const viewer = usePotreeStore((s) => s.viewer);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {},
  );
  const pointCloudsRef = useRef<Map<string, LoadedPointCloud>>(new Map());
  const [, forceUpdate] = useState({});

  const loadPointCloud = useCallback(
    (
      source: PointCloudSource,
      options: PointCloudMaterialOptions = {},
    ): Promise<LoadedPointCloud | null> => {
      return new Promise((resolve) => {
        const Potree = window.Potree;
        if (!Potree || !viewer) {
          resolve(null);
          return;
        }

        setLoadingStates((prev) => ({ ...prev, [source.id]: true }));
        const opts = { ...DEFAULT_MATERIAL_OPTIONS, ...options };

        Potree.loadPointCloud(
          source.url,
          source.name,
          (result: { pointcloud: Potree.PointCloudOctree }) => {
            if (!result?.pointcloud) {
              setLoadingStates((prev) => ({ ...prev, [source.id]: false }));
              resolve(null);
              return;
            }

            const { pointcloud } = result;
            pointcloud.material.size = opts.size ?? 0.6;
            pointcloud.material.pointSizeType = getPointSizeType(
              opts.pointSizeType ?? "adaptive",
            );
            pointcloud.material.shape = getPointShape(opts.shape ?? "square");
            pointcloud.material.activeAttributeName =
              opts.activeAttributeName ?? "elevation";

            viewer.scene.addPointCloud(pointcloud);

            const bbox = pointcloud.boundingBox;
            const center = {
              x: (bbox.min.x + bbox.max.x) / 2,
              y: (bbox.min.y + bbox.max.y) / 2,
              z: (bbox.min.z + bbox.max.z) / 2,
            };
            const size = Math.max(
              bbox.max.x - bbox.min.x,
              bbox.max.y - bbox.min.y,
              bbox.max.z - bbox.min.z,
            );

            const loaded: LoadedPointCloud = {
              id: source.id,
              name: source.name,
              pointcloud,
              center,
              size,
            };

            pointCloudsRef.current.set(source.id, loaded);
            setLoadingStates((prev) => ({ ...prev, [source.id]: false }));
            forceUpdate({});
            resolve(loaded);
          },
        );
      });
    },
    [viewer],
  );

  const loadPointClouds = useCallback(
    async (
      sources: PointCloudSource[],
      options: PointCloudMaterialOptions = {},
    ): Promise<void> => {
      await Promise.all(
        sources.map((source) => loadPointCloud(source, options)),
      );
    },
    [loadPointCloud],
  );

  const flyTo = useCallback(
    (id: string, factor: number = 1.2, duration: number = 1000): void => {
      if (!viewer) return;
      const loaded = pointCloudsRef.current.get(id);
      if (!loaded) return;
      viewer.zoomTo(loaded.pointcloud, factor, duration);
    },
    [viewer],
  );

  const fitAll = useCallback((): void => {
    if (!viewer) return;
    viewer.fitToScreen();
  }, [viewer]);

  const getPointCloud = useCallback(
    (id: string): LoadedPointCloud | undefined => {
      return pointCloudsRef.current.get(id);
    },
    [],
  );

  return {
    pointClouds: pointCloudsRef.current,
    loadingStates,
    loadPointCloud,
    loadPointClouds,
    flyTo,
    fitAll,
    getPointCloud,
  };
}
