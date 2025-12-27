"use client";

import type { ReactNode } from "react";
import { usePotreeStore } from "../store";
import { CONTAINER_IDS, BASE_PATH } from "../constants";

interface ViewerContainerProps {
  hasCesium: boolean;
  sidebar: boolean;
  children?: ReactNode;
}

export function ViewerContainer({
  hasCesium,
  sidebar,
  children,
}: ViewerContainerProps): ReactNode {
  const containerId = usePotreeStore((s) => s.containerId);
  const cesiumId = CONTAINER_IDS.cesium(containerId);

  return (
    <div className="potree_container absolute left-0 top-0 h-full w-full">
      <div
        id={containerId}
        className="potree_render_area absolute bottom-0 left-0 right-0 top-0 z-[1] overflow-hidden"
        style={{
          transition: "left .35s",
          backgroundImage: `url('${BASE_PATH}/build/potree/resources/images/background.jpg')`,
        }}
      >
        {hasCesium && <div id={cesiumId} className="absolute h-full w-full" />}
      </div>
      {sidebar && (
        <div id={CONTAINER_IDS.sidebar} className="potree_sidebar_container" />
      )}
      {children}
    </div>
  );
}
