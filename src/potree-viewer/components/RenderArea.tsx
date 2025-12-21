'use client';

/**
 * RenderArea - Potree render area container
 *
 * Structure (matching Potree reference implementation):
 * - potree_container (outer wrapper)
 *   - potree_render_area_class (render area - contains Potree canvas)
 *     - cesium_container (Cesium canvas - INSIDE render area)
 *     - children
 *   - potree_sidebar_container (sidebar - sibling to render area)
 */

import type { ReactNode, CSSProperties } from 'react';
import { usePotreeStore } from '../store';
import { CONTAINER_IDS, BASE_PATH } from '../potree.config';

interface Props {
  children?: ReactNode;
  style?: CSSProperties;
  hasCesium?: boolean;
  sidebar?: boolean;
}

export function RenderArea({ children, style, hasCesium = false, sidebar = false }: Props) {
  const containerId = usePotreeStore((s) => s.containerId);
  const cesiumContainerId = CONTAINER_IDS.getCesiumId(containerId);
  const sidebarContainerId = CONTAINER_IDS.getSidebarId(containerId);

  return (
    <div className="potree_container absolute left-0 top-0 h-full w-full">
      {/* Cesium container - BEHIND Potree (z-index: 0), as sibling to avoid Potree clearing it */}
      {hasCesium && (
        <div
          id={cesiumContainerId}
          className="absolute left-0 top-0 h-full w-full"
          style={{ zIndex: 0 }}
        />
      )}

      {/* Render area - Potree canvas renders here (z-index: 1) */}
      <div
        id={containerId}
        className="potree_render_area_class absolute bottom-0 left-0 right-0 top-0 overflow-hidden"
        style={{
          zIndex: 1,
          background: hasCesium ? 'transparent' : undefined,
          backgroundImage: hasCesium
            ? 'none'
            : `url('${BASE_PATH}/build/potree/resources/images/background.jpg')`,
          ...style,
        }}
      >
        {children}
      </div>

      {/* Sidebar container - outside render area but inside container */}
      {sidebar && (
        <div
          id={CONTAINER_IDS.sidebar}
          className="potree_sidebar_container"
        />
      )}
    </div>
  );
}
