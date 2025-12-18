'use client';

/**
 * PotreeContainer Component
 * Provides the DOM structure required by Potree viewer
 */

import { forwardRef, type ReactNode, type CSSProperties } from 'react';

// ============================================
// Types
// ============================================

export interface PotreeContainerProps {
  /** Unique ID for the render area */
  renderAreaId?: string;
  /** Unique ID for the sidebar container */
  sidebarId?: string;
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Whether to include Cesium container */
  includeCesium?: boolean;
  /** Cesium container ID */
  cesiumId?: string;
  /** Children rendered inside the render area */
  children?: ReactNode;
}

// ============================================
// Default Styles
// ============================================

const containerStyles: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
};

const potreeContainerStyles: CSSProperties = {
  position: 'absolute',
  inset: 0,
};

const renderAreaStyles: CSSProperties = {
  width: '100%',
  height: '100%',
};

const cesiumContainerStyles: CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  zIndex: -10,
};

// ============================================
// Component
// ============================================

export const PotreeContainer = forwardRef<HTMLDivElement, PotreeContainerProps>(
  function PotreeContainer(
    {
      renderAreaId = 'potree_render_area',
      sidebarId = 'potree_sidebar_container',
      className = '',
      style,
      includeCesium = false,
      cesiumId = 'cesium_container',
      children,
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={`potree-wrapper ${className}`.trim()}
        style={{ ...containerStyles, ...style }}
      >
        <div className="potree_container" style={potreeContainerStyles}>
          {/* Main Render Area - Potree renders here */}
          <div
            id={renderAreaId}
            style={renderAreaStyles}
            data-potree-render="false"
          >
            {/* Optional Cesium container for globe/map integration */}
            {includeCesium && (
              <div
                id={cesiumId}
                style={cesiumContainerStyles}
                data-cesium-render="false"
              />
            )}

            {/* Additional children (overlays, etc.) */}
            {children}
          </div>

          {/* Sidebar Container - Potree GUI renders here */}
          <div id={sidebarId} />
        </div>
      </div>
    );
  }
);

export default PotreeContainer;
