"use client";

/**
 * Navigation Controls - Info panel with view controls
 *
 * Potree controls the camera, Cesium just follows
 */

import { cn } from "@/lib/utils";
import { usePotreeViewer } from "@/potree-viewer";

interface NavigationControlsProps {
  isReady: boolean;
}

export default function NavigationControls({
  isReady,
}: NavigationControlsProps) {
  const { viewer } = usePotreeViewer();

  // Fit camera to show all point clouds
  const fitToScreen = () => {
    if (!viewer) return;
    viewer.fitToScreen();
  };

  // Log current position for debugging
  const logPosition = () => {
    if (!viewer) return;
    const view = viewer.scene.view;
    console.log("Position:", view.position);
    console.log("Pivot:", view.getPivot());
  };

  return (
    <div
      className={cn(
        "absolute right-4 top-4 z-[1000]",
        "max-w-[280px] rounded-lg bg-black/75 px-5 py-4",
        "text-sm text-white backdrop-blur-sm",
        "pointer-events-auto",
      )}
    >
      <h3 className="mb-3 text-base font-semibold">Potree + Cesium Demo</h3>

      <div className="mb-3 opacity-90">
        <strong>Status:</strong>{" "}
        <span className={isReady ? "text-green-400" : "text-yellow-400"}>
          {isReady ? "Ready" : "Loading..."}
        </span>
      </div>

      <div className="mb-4 space-y-0.5 text-xs opacity-80">
        <div>Left-drag: Rotate</div>
        <div>Right-drag: Pan</div>
        <div>Scroll: Zoom</div>
        <div>Double-click: Zoom to point</div>
      </div>

      {isReady && (
        <div className="border-t border-white/20 pt-3">
          <div className="mb-2 text-xs opacity-70">Controls:</div>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={fitToScreen}
              className={cn(
                "rounded px-3 py-2 text-xs",
                "bg-blue-500 text-white",
                "cursor-pointer border-none",
                "hover:bg-blue-600 transition-colors",
              )}
            >
              Fit to Screen
            </button>
            <button
              onClick={logPosition}
              className={cn(
                "rounded px-3 py-2 text-xs",
                "bg-gray-500 text-white",
                "cursor-pointer border-none",
                "hover:bg-gray-600 transition-colors",
              )}
            >
              Log Position
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
