/**
 * Potree Viewer - Centralized Configuration
 *
 * This file is the single source of truth for all Potree/Cesium configuration.
 * Import and use these configs in your components.
 */

import type { PotreeViewerConfig, CesiumConfig, PointCloudConfig, UTMZone, Background } from './types';

// ============================================
// Base Path Configuration
// ============================================
export const BASE_PATH = '/potree-static';

// ============================================
// Default Viewer Configuration
// ============================================
export const DEFAULT_VIEWER_CONFIG: Required<PotreeViewerConfig> = {
  fov: 60,
  pointBudget: 1_000_000,
  edlEnabled: true,
  edlRadius: 1.4,
  edlStrength: 0.4,
  background: null as Background, // null = transparent (for Cesium overlay)
  controls: 'earth',
  showGUI: true,
  showSidebar: true,
};

// ============================================
// Default Cesium Configuration
// ============================================
export const DEFAULT_CESIUM_CONFIG: Required<CesiumConfig> = {
  enabled: true,
  zone: '47' as UTMZone,
  offsetZ: 0,
  mapProvider: 'osm',
  initialPosition: {
    lon: 100.5,
    lat: 13.75,
    height: 500000,
  },
};

// ============================================
// Container IDs - Use these for consistency
// ============================================
export const CONTAINER_IDS = {
  // Default container ID (can be overridden per instance)
  default: 'potree_render_area',

  // IMPORTANT: Potree's loadGUI is HARDCODED to use '#potree_sidebar_container'
  // We cannot use dynamic IDs for the sidebar container
  sidebar: 'potree_sidebar_container',

  // Generate consistent container IDs
  getRenderAreaId: (base: string) => base,
  // Sidebar must use fixed ID - Potree's loadGUI hardcodes $('#potree_sidebar_container')
  getSidebarId: (_base: string) => 'potree_sidebar_container',
  getCesiumId: (base: string) => `cesium_container_${base}`,
} as const;

// ============================================
// Z-Index Layers
// ============================================
export const Z_INDEX = {
  cesium: 0,        // Globe at bottom
  potreeCanvas: 1,  // Point cloud layer
  sidebar: 100,     // Sidebar above everything
  overlay: 1000,    // UI overlays on top
} as const;

// ============================================
// Sample Point Cloud Configurations
// ============================================
export const SAMPLE_POINT_CLOUDS: PointCloudConfig[] = [
  // Add your point cloud configurations here
  // {
  //   url: '/pointclouds/sample/metadata.json',
  //   name: 'Sample Point Cloud',
  //   position: { x: 0, y: 0, z: 0 },
  //   visible: true,
  //   size: 1,
  //   sizeType: 'adaptive',
  //   shape: 'square',
  //   activeAttribute: 'rgba',
  // },
];

// ============================================
// Preset Configurations
// ============================================
export const PRESETS = {
  // Standard Potree-only viewer
  standard: {
    config: {
      ...DEFAULT_VIEWER_CONFIG,
      background: 'gradient' as Background,
      controls: 'orbit' as const,
    },
    cesium: undefined,
  },

  // Cesium + Potree integration
  cesiumIntegration: {
    config: {
      ...DEFAULT_VIEWER_CONFIG,
      background: null as Background, // Transparent for Cesium
      controls: 'earth' as const,
    },
    cesium: DEFAULT_CESIUM_CONFIG,
  },

  // High quality rendering
  highQuality: {
    config: {
      ...DEFAULT_VIEWER_CONFIG,
      pointBudget: 5_000_000,
      edlEnabled: true,
      edlRadius: 1.8,
      edlStrength: 0.6,
    },
    cesium: undefined,
  },

  // Performance mode
  performance: {
    config: {
      ...DEFAULT_VIEWER_CONFIG,
      pointBudget: 500_000,
      edlEnabled: false,
    },
    cesium: undefined,
  },
} as const;

// ============================================
// Helper Functions
// ============================================

/**
 * Merge user config with defaults
 */
export function mergeViewerConfig(userConfig?: Partial<PotreeViewerConfig>): PotreeViewerConfig {
  return { ...DEFAULT_VIEWER_CONFIG, ...userConfig };
}

/**
 * Merge user Cesium config with defaults
 */
export function mergeCesiumConfig(userConfig?: Partial<CesiumConfig>): CesiumConfig | undefined {
  if (!userConfig) return undefined;
  return { ...DEFAULT_CESIUM_CONFIG, ...userConfig };
}

/**
 * Check if Cesium should be enabled
 */
export function isCesiumEnabled(cesiumConfig?: CesiumConfig): boolean {
  return cesiumConfig?.enabled !== false && cesiumConfig !== undefined;
}
