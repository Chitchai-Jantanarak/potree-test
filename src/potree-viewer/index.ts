/**
 * Potree Viewer - Main exports
 */

// Main component (recommended)
export { PotreeViewer } from './components';

// Lower-level components
export {
  PotreeLoader,
  RenderArea,
  CesiumCanvas,
  InitialHook,
  UpdateHook,
  PotreeViewerSimple,
  CesiumPotreeViewer,
} from './components';

// Hooks
export { usePotreeViewer, usePointCloud, useCesiumPotree } from './hooks';

// Store
export { PotreeProvider, usePotreeStore, usePotreeStoreApi } from './store';

// Constants
export {
  DEFAULT_BASE_PATH,
  getScriptPaths,
  getStylesheetPaths,
  getCesiumScriptPath,
  getCesiumStylesheetPath,
  getCesiumBasePath,
  MAP_PROVIDERS,
  DEFAULT_LOCATIONS,
  type MapProvider,
  type LocationName,
} from './constants';

// Centralized Config
export {
  BASE_PATH,
  DEFAULT_VIEWER_CONFIG,
  DEFAULT_CESIUM_CONFIG,
  CONTAINER_IDS,
  Z_INDEX,
  PRESETS,
  mergeViewerConfig,
  mergeCesiumConfig,
  isCesiumEnabled,
} from './potree.config';

// Types
export type {
  PotreeViewerConfig,
  PointCloudConfig,
  PotreeViewerProps,
  PotreeStore,
  CesiumConfig,
  UTMZone,
  Background,
} from './types';
