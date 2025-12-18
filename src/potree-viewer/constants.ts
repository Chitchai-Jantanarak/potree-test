/**
 * Potree Viewer Constants
 * Default configurations and static asset paths
 */

import type { PotreeViewerConfig, PointCloudConfig } from './types';

// ============================================
// Default Base Path
// ============================================

export const DEFAULT_BASE_PATH = '/potree-static';

// ============================================
// Default Viewer Configuration
// ============================================

export const DEFAULT_VIEWER_CONFIG: Required<PotreeViewerConfig> = {
  edlEnabled: false,
  edlRadius: 1.4,
  edlStrength: 0.4,
  fov: 60,
  pointBudget: 1_000_000,
  background: null,
  controls: 'earth',
  language: 'en',
  showSidebar: true,
  showGUI: true,
};

// ============================================
// Default Point Cloud Configuration
// ============================================

export const DEFAULT_POINT_CLOUD_CONFIG: Required<Omit<PointCloudConfig, 'url' | 'name'>> = {
  size: 1,
  sizeType: 'adaptive',
  shape: 'square',
  opacity: 1,
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
  visible: true,
};

// ============================================
// Script Loading Order (Critical - Must be in order)
// ============================================

export const getScriptPaths = (basePath: string = DEFAULT_BASE_PATH): readonly string[] => [
  // jQuery - Required first as many libs depend on it
  `${basePath}/lib/jquery/jquery-3.1.1.min.js`,

  // Coordinate transformations
  `${basePath}/lib/proj4/proj4.js`,

  // Utilities
  `${basePath}/lib/other/BinaryHeap.js`,

  // Animation
  `${basePath}/lib/tween/tween.min.js`,

  // Internationalization
  `${basePath}/lib/i18next/i18next.js`,

  // Charting
  `${basePath}/lib/d3/d3.js`,

  // Tree UI component
  `${basePath}/lib/jstree/jstree.js`,

  // Color picker
  `${basePath}/lib/spectrum/spectrum.js`,

  // jQuery UI - After jQuery and spectrum
  `${basePath}/lib/jquery-ui/jquery-ui.min.js`,

  // Three.js (if not bundled in potree.js)
  // `${basePath}/lib/three.js/three.js`,

  // Main Potree library - Must be last
  `${basePath}/build/potree/potree.js`,
] as const;

// ============================================
// Stylesheet Paths
// ============================================

export const getStylesheetPaths = (basePath: string = DEFAULT_BASE_PATH): readonly string[] => [
  `${basePath}/build/potree/potree.css`,
  `${basePath}/lib/jquery-ui/jquery-ui.min.css`,
  `${basePath}/lib/spectrum/spectrum.css`,
  `${basePath}/lib/jstree/themes/mixed/style.css`,
] as const;

// ============================================
// Shader Paths
// ============================================

export const getShaderPath = (basePath: string = DEFAULT_BASE_PATH): string =>
  `${basePath}/build/shaders/shaders.js`;

// ============================================
// Worker Paths
// ============================================

export const getWorkerPaths = (basePath: string = DEFAULT_BASE_PATH) => ({
  binaryDecoder: `${basePath}/build/potree/workers/BinaryDecoderWorker.js`,
  lasDecoder: `${basePath}/build/potree/workers/LASDecoderWorker.js`,
  lasLazWorker: `${basePath}/build/potree/workers/LASLAZWorker.js`,
  eptBinaryDecoder: `${basePath}/build/potree/workers/EptBinaryDecoderWorker.js`,
  eptLaszipDecoder: `${basePath}/build/potree/workers/EptLaszipDecoderWorker.js`,
  eptZstandardDecoder: `${basePath}/build/potree/workers/EptZstandardDecoderWorker.js`,
  decoderWorker: `${basePath}/build/potree/workers/2.0/DecoderWorker.js`,
  decoderWorkerBrotli: `${basePath}/build/potree/workers/2.0/DecoderWorker_brotli.js`,
} as const);

// ============================================
// Resource Paths
// ============================================

export const getResourcePaths = (basePath: string = DEFAULT_BASE_PATH) => ({
  icons: `${basePath}/build/potree/resources/icons`,
  images: `${basePath}/build/potree/resources/images`,
  lang: `${basePath}/build/potree/resources/lang`,
  models: `${basePath}/build/potree/resources/models`,
  textures: `${basePath}/build/potree/resources/textures`,
} as const);

// ============================================
// Point Size Type Mapping
// ============================================

export const POINT_SIZE_TYPE_MAP = {
  fixed: 0,    // Potree.PointSizeType.FIXED
  attenuated: 1, // Potree.PointSizeType.ATTENUATED
  adaptive: 2,   // Potree.PointSizeType.ADAPTIVE
} as const;

// ============================================
// Point Shape Mapping
// ============================================

export const POINT_SHAPE_MAP = {
  square: 0,    // Potree.PointShape.SQUARE
  circle: 1,    // Potree.PointShape.CIRCLE
  paraboloid: 2, // Potree.PointShape.PARABOLOID
} as const;

// ============================================
// Control Type Mapping
// ============================================

export const CONTROL_TYPE_MAP = {
  earth: 'earthControls',
  orbit: 'orbitControls',
  firstPerson: 'fpControls',
} as const;
