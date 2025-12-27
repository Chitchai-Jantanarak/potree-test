"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { usePointCloudLoader, type PointCloudSource } from "@/potree-viewer";

interface PointCloudControlsProps {
  sources: (PointCloudSource & { color: string })[];
}

export default function PointCloudControls({
  sources,
}: PointCloudControlsProps) {
  const { loadingStates, loadPointClouds, flyTo, fitAll, pointClouds } =
    usePointCloudLoader();
  const [activeCloud, setActiveCloud] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    setInitialized(true);

    loadPointClouds(sources).then(() => {
      if (sources.length > 0) {
        flyTo(sources[0].id, 1.2, 500);
        setActiveCloud(sources[0].id);
      }
    });
  }, [initialized, sources, loadPointClouds, flyTo]);

  const handleFlyTo = (id: string) => {
    flyTo(id, 1.2, 1000);
    setActiveCloud(id);
  };

  const isLoading = Object.values(loadingStates).some(Boolean);

  return (
    <div
      className={cn(
        "absolute right-4 top-4 z-[1000]",
        "w-[300px] rounded-lg bg-black/80 px-5 py-4",
        "text-sm text-white backdrop-blur-sm",
        "pointer-events-auto",
      )}
    >
      <h3 className="mb-3 text-base font-semibold">Multi Point Cloud Demo</h3>

      <div className="mb-3 opacity-90">
        <strong>Status:</strong>{" "}
        <span className={!isLoading ? "text-green-400" : "text-yellow-400"}>
          {isLoading ? "Loading..." : `${pointClouds.size} loaded`}
        </span>
      </div>

      <div className="mb-4 border-t border-white/20 pt-3">
        <div className="mb-2 text-xs font-medium opacity-80">Point Clouds:</div>
        <div className="flex flex-col gap-2">
          {sources.map((pc) => {
            const loading = loadingStates[pc.id];
            const isActive = activeCloud === pc.id;

            return (
              <button
                key={pc.id}
                onClick={() => handleFlyTo(pc.id)}
                disabled={loading}
                className={cn(
                  "flex items-center gap-2 rounded px-3 py-2 text-left text-xs",
                  "transition-all duration-200 border-2",
                  isActive
                    ? "border-white bg-white/20"
                    : "border-transparent bg-white/10 hover:bg-white/20",
                  loading && "cursor-not-allowed opacity-50",
                )}
              >
                <span
                  className="h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: pc.color }}
                />
                <span className="flex-1">{pc.name}</span>
                {loading && (
                  <span className="text-[10px] text-yellow-400">
                    Loading...
                  </span>
                )}
                {!loading && isActive && (
                  <span className="text-[10px] text-green-400">Active</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4 space-y-0.5 text-xs opacity-70">
        <div>Left-drag: Rotate</div>
        <div>Right-drag: Pan</div>
        <div>Scroll: Zoom</div>
        <div>Double-click: Zoom to point</div>
      </div>

      <div className="border-t border-white/20 pt-3">
        <div className="mb-2 text-xs opacity-70">Actions:</div>
        <div className="flex gap-2">
          <button
            onClick={fitAll}
            className={cn(
              "flex-1 rounded px-3 py-2 text-xs",
              "bg-blue-500 text-white border-none",
              "transition-colors hover:bg-blue-600",
            )}
          >
            Fit All
          </button>
        </div>
      </div>
    </div>
  );
}
