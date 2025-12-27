"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import type { PointCloudSource } from "@/potree-viewer";

const PotreeViewer = dynamic(
  () => import("@/potree-viewer").then((mod) => mod.PotreeViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#1a1a2e] text-white">
        Loading Potree Viewer...
      </div>
    ),
  },
);

const PointCloudControls = dynamic(
  () => import("./_components/PointCloudControls"),
  {
    ssr: false,
  },
);

const POINT_CLOUDS: (PointCloudSource & { color: string })[] = [
  {
    id: "san-francisco",
    name: "San Francisco, CA",
    url: "https://s3-us-west-2.amazonaws.com/usgs-lidar-public/CA_SanFrancisco_1_B23/ept.json",
    color: "#3b82f6",
  },
  {
    id: "new-york",
    name: "New York City, NY",
    url: "https://s3-us-west-2.amazonaws.com/usgs-lidar-public/NY_NewYorkCity/ept.json",
    color: "#ef4444",
  },
];

export default function DemoPage() {
  const [isReady, setIsReady] = useState(false);
  const handleReady = useCallback(() => setIsReady(true), []);

  return (
    <div className="relative h-screen w-screen">
      <PotreeViewer
        sidebar
        cesium={{ projection: "mercator", mapProvider: "esri" }}
        onReady={handleReady}
      >
        {isReady && <PointCloudControls sources={POINT_CLOUDS} />}
      </PotreeViewer>
    </div>
  );
}
