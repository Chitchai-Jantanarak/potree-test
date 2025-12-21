'use client';

/**
 * PotreeViewer - Main wrapper component
 *
 * Structure:
 * - Cesium (z-index: 0) - 3D globe behind everything
 * - Potree RenderArea (z-index: 1) - point cloud on top
 * - Sidebar (fixed left) - UI controls
 */

import { PotreeProvider } from '../store';
import { PotreeLoader } from './PotreeLoader';
import { RenderArea } from './RenderArea';
import { CesiumCanvas } from './CesiumCanvas';
import { InitialHook } from './InitialHook';
import { UpdateHook } from './UpdateHook';
import type { PotreeViewerProps } from '../types';
import '../styles/potree-viewer.css';

export default function PotreeViewer(props: PotreeViewerProps) {
  const {
    url,
    containerId = 'potree_render_area',
    config = {},
    cesium,
    pointClouds = [],
    sidebar = false,
    autoFocus = true,
    className,
    style,
    renderAreaChildren,
    children,
    onReady,
    onPointCloudLoaded,
    onError,
  } = props;

  const hasCesium = cesium?.enabled !== false && cesium !== undefined;

  return (
    <PotreeProvider
      containerId={containerId}
      url={url}
      zone={cesium?.zone}
      offsetZ={cesium?.offsetZ}
    >
      <PotreeLoader
        basePath="/potree-static"
        includeCesium={hasCesium}
        onError={onError}
      >
        <div
          className={`potree_container ${className || ''}`}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            ...style,
          }}
        >
          {/* Cesium container - behind Potree */}
          {hasCesium && (
            <div
              id={`cesium_container_${containerId}`}
              className="cesium-container"
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                zIndex: 0,
              }}
            />
          )}

          {/* Potree render area - on top of Cesium */}
          <RenderArea hasCesium={hasCesium}>
            {renderAreaChildren}
          </RenderArea>

          {/* Sidebar container */}
          {sidebar && (
            <div
              id={`potree_sidebar_container_${containerId}`}
              className="potree_sidebar_container"
            />
          )}

          {/* Hooks - these don't render anything, just side effects */}
          <InitialHook config={config} sidebar={sidebar} hasCesium={hasCesium} onReady={onReady} />
          <UpdateHook
            pointClouds={pointClouds}
            autoFocus={autoFocus}
            onPointCloudLoaded={onPointCloudLoaded}
          />
          {hasCesium && <CesiumCanvas config={cesium} />}

          {/* Additional children */}
          {children}
        </div>
      </PotreeLoader>
    </PotreeProvider>
  );
}
