/**
 * Potree Viewer for Next.js
 *
 * A flexible, pure Potree integration for Next.js applications.
 * Uses static Potree build from public/potree-static directory.
 *
 * @example Basic Usage
 * ```tsx
 * import { PotreeProvider, PotreeLoader, PotreeViewer } from '@/src/potree-viewer';
 *
 * export default function PointCloudPage() {
 *   return (
 *     <PotreeProvider>
 *       <PotreeLoader basePath="/potree-static">
 *         <PotreeViewer
 *           config={{ fov: 60, pointBudget: 1000000 }}
 *           pointClouds={[
 *             { url: '/pointcloud/metadata.json', name: 'myCloud' }
 *           ]}
 *           onReady={(viewer) => console.log('Viewer ready!')}
 *         />
 *       </PotreeLoader>
 *     </PotreeProvider>
 *   );
 * }
 * ```
 *
 * @example With Hooks
 * ```tsx
 * import {
 *   PotreeProvider,
 *   PotreeLoader,
 *   PotreeViewer,
 *   usePotreeViewer
 * } from '@/src/potree-viewer';
 *
 * function Controls() {
 *   const { viewer, loadPointCloud, fitToScreen } = usePotreeViewer();
 *
 *   const handleLoad = async () => {
 *     await loadPointCloud({ url: '/cloud.json', name: 'dynamic' });
 *     fitToScreen();
 *   };
 *
 *   return <button onClick={handleLoad}>Load Cloud</button>;
 * }
 * ```
 */

// ============================================
// Components
// ============================================

export { PotreeLoader } from './components/PotreeLoader';
export type { PotreeLoaderProps } from './components/PotreeLoader';

export { PotreeContainer } from './components/PotreeContainer';
export type { PotreeContainerProps } from './components/PotreeContainer';

export { PotreeViewer } from './components/PotreeViewer';
export type { PotreeViewerProps } from './components/PotreeViewer';

// ============================================
// Store & Provider
// ============================================

export {
  PotreeProvider,
  usePotreeStore,
  usePotreeStoreApi,
  createPotreeStore,
  // Selectors
  selectViewer,
  selectIsLoading,
  selectScriptsLoaded,
  selectError,
  selectPointClouds,
} from './store';
export type { PotreeViewerStore, PotreeViewerState, PotreeViewerActions } from './store';

// ============================================
// Hooks
// ============================================

export { usePotreeViewer } from './hooks/usePotreeViewer';
export { usePointCloud } from './hooks/usePointCloud';
export type { UsePointCloudOptions, UsePointCloudReturn } from './hooks/usePointCloud';

// ============================================
// Types
// ============================================

export type {
  PotreeViewerConfig,
  PointCloudConfig,
  PotreeProviderProps,
  UsePotreeViewerReturn,
  ScriptLoadStatus,
  ScriptInfo,
  StylesheetInfo,
} from './types';

// ============================================
// Constants
// ============================================

export {
  DEFAULT_BASE_PATH,
  DEFAULT_VIEWER_CONFIG,
  DEFAULT_POINT_CLOUD_CONFIG,
  POINT_SIZE_TYPE_MAP,
  POINT_SHAPE_MAP,
  CONTROL_TYPE_MAP,
  getScriptPaths,
  getStylesheetPaths,
  getShaderPath,
  getWorkerPaths,
  getResourcePaths,
} from './constants';
