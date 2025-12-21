'use client';

/**
 * PotreeViewer - Main wrapper component
 *
 * Structure (matching reference implementation):
 * - potree_container (outer wrapper with className)
 *   - potree_render_area_class (Potree canvas)
 *     - cesium_container (Cesium canvas - INSIDE render area)
 *   - potree_sidebar_container (sidebar - sibling to render area)
 */

import { PotreeProvider } from '../store';
import { PotreeLoader } from './PotreeLoader';
import { RenderArea } from './RenderArea';
import { CesiumCanvas } from './CesiumCanvas';
import { InitialHook } from './InitialHook';
import { UpdateHook } from './UpdateHook';
import { BASE_PATH, CONTAINER_IDS, isCesiumEnabled, mergeViewerConfig } from '../potree.config';
import type { PotreeViewerProps } from '../types';
import '../styles/potree-viewer.css';

export default function PotreeViewer(props: PotreeViewerProps) {
  const {
    url,
    containerId = CONTAINER_IDS.default,
    config: userConfig,
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

  // Use centralized config with user overrides
  const config = mergeViewerConfig(userConfig);
  const hasCesium = isCesiumEnabled(cesium);

  // Build container class names
  const containerClasses = [
    hasCesium ? 'has-cesium' : '',
    className || '',
  ].filter(Boolean).join(' ');

  return (
    <PotreeProvider
      containerId={containerId}
      url={url}
      zone={cesium?.zone}
      offsetZ={cesium?.offsetZ}
    >
      <PotreeLoader
        basePath={BASE_PATH}
        includeCesium={hasCesium}
        onError={onError}
      >
        {/* Outer container for positioning */}
        <div
          className={containerClasses}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            ...style,
          }}
        >
          {/* RenderArea now handles Cesium container and sidebar container */}
          <RenderArea hasCesium={hasCesium} sidebar={sidebar}>
            {renderAreaChildren}
          </RenderArea>

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
