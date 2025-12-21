'use client';

/**
 * RenderArea - Potree render area container
 * When Cesium is active, background is transparent to show the globe
 */

import type { ReactNode, CSSProperties } from 'react';
import { usePotreeStore } from '../store';

interface Props {
  children?: ReactNode;
  style?: CSSProperties;
  hasCesium?: boolean;
}

export function RenderArea({ children, style, hasCesium = false }: Props) {
  const containerId = usePotreeStore((s) => s.containerId);

  return (
    <div
      id={containerId}
      className="potree_render_area_class"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        overflow: 'hidden',
        transition: 'left .35s',
        // Transparent when Cesium is enabled so globe shows through
        background: hasCesium ? 'transparent' : undefined,
        backgroundImage: hasCesium
          ? 'none'
          : "url('/potree-static/build/potree/resources/images/background.jpg')",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
