"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useRef } from "react";

const PotreeViewer = dynamic(
  () => import("@/potree-viewer").then((mod) => mod.PotreeViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#1a1a2e] text-white">
        Loading Potree Viewer...
      </div>
    ),
  }
);

const POINT_CLOUD_URL = "https://s3-us-west-2.amazonaws.com/usgs-lidar-public/CA_SanFrancisco_1_B23/ept.json";

export default function PotreeOnlyPage() {
  const [isReady, setIsReady] = useState(false);
  const loadedRef = useRef(false);

  const handleReady = useCallback((viewer: Potree.Viewer) => {
    setIsReady(true);
    if (loadedRef.current) return;
    loadedRef.current = true;

    const Potree = window.Potree;
    if (!Potree) return;

    Potree.loadPointCloud(POINT_CLOUD_URL, "San Francisco", (result: { pointcloud: Potree.PointCloudOctree }) => {
      if (!result?.pointcloud) return;

      const { pointcloud } = result;
      pointcloud.material.size = 0.6;
      pointcloud.material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
      pointcloud.material.shape = Potree.PointShape.SQUARE;
      pointcloud.material.activeAttributeName = "elevation";

      viewer.scene.addPointCloud(pointcloud);
      viewer.fitToScreen();
    });
  }, []);

  return (
    <div className="relative h-screen w-screen">
      <PotreeViewer
        variant="minimal"
        sidebar
        onReady={handleReady}
      />
      <div className="absolute right-4 top-4 rounded-lg bg-black/70 p-4 text-white">
        <h2 className="mb-2 text-lg font-bold">Pure Potree Demo</h2>
        <p className="text-sm">Status: {isReady ? <span className="text-green-400">Ready</span> : "Loading..."}</p>
        <div className="mt-2 text-xs text-gray-300">
          <p>No Cesium - Potree only</p>
        </div>
      </div>
    </div>
  );
}
