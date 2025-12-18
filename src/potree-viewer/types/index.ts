/**
 * Potree Viewer Type Definitions
 * Re-exports and custom types for the Potree viewer integration
 */

import type { ReactNode } from 'react';

// Re-export Potree types
export type { Potree } from './potree.d';

// ============================================
// Viewer Configuration Types
// ============================================

export interface PotreeViewerConfig {
  /** Enable Eye-Dome Lighting effect */
  edlEnabled?: boolean;
  /** EDL radius */
  edlRadius?: number;
  /** EDL strength */
  edlStrength?: number;
  /** Field of view in degrees */
  fov?: number;
  /** Maximum number of points to render */
  pointBudget?: number;
  /** Background style */
  background?: 'skybox' | 'gradient' | 'black' | 'white' | null;
  /** Default control type */
  controls?: 'earth' | 'orbit' | 'firstPerson';
  /** Language for UI */
  language?: string;
  /** Show sidebar */
  showSidebar?: boolean;
  /** Show GUI */
  showGUI?: boolean;
}

export interface PointCloudConfig {
  /** URL to the point cloud metadata */
  url: string;
  /** Name identifier for the point cloud */
  name: string;
  /** Point size */
  size?: number;
  /** Point size type */
  sizeType?: 'fixed' | 'attenuated' | 'adaptive';
  /** Point shape */
  shape?: 'square' | 'circle' | 'paraboloid';
  /** Opacity */
  opacity?: number;
  /** Position offset */
  position?: { x?: number; y?: number; z?: number };
  /** Rotation in radians */
  rotation?: { x?: number; y?: number; z?: number };
  /** Scale */
  scale?: { x?: number; y?: number; z?: number };
  /** Initial visibility */
  visible?: boolean;
}

// ============================================
// Component Props Types
// ============================================

export interface PotreeProviderProps {
  children: ReactNode;
  /** Base path for Potree static assets */
  basePath?: string;
}

export interface PotreeViewerProps {
  /** Viewer configuration */
  config?: PotreeViewerConfig;
  /** Point clouds to load */
  pointClouds?: PointCloudConfig[];
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Callback when viewer is ready */
  onReady?: (viewer: Potree.Viewer) => void;
  /** Callback when point cloud is loaded */
  onPointCloudLoaded?: (result: Potree.LoadPointCloudResult) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Children components */
  children?: ReactNode;
}

export interface PotreeLoaderProps {
  /** Base path for static assets (default: /potree-static) */
  basePath?: string;
  /** Callback when all scripts are loaded */
  onLoad?: () => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Children to render after loading */
  children?: ReactNode;
}

// ============================================
// Store Types
// ============================================

export interface PotreeViewerState {
  /** The Potree viewer instance */
  viewer: Potree.Viewer | null;
  /** Loading state */
  isLoading: boolean;
  /** Whether scripts are loaded */
  scriptsLoaded: boolean;
  /** Error if any */
  error: Error | null;
  /** Loaded point clouds */
  pointClouds: Map<string, Potree.PointCloudOctree>;
}

export interface PotreeViewerActions {
  /** Set the viewer instance */
  setViewer: (viewer: Potree.Viewer | null) => void;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Set scripts loaded state */
  setScriptsLoaded: (loaded: boolean) => void;
  /** Set error */
  setError: (error: Error | null) => void;
  /** Add a point cloud to tracking */
  addPointCloud: (name: string, pointCloud: Potree.PointCloudOctree) => void;
  /** Remove a point cloud from tracking */
  removePointCloud: (name: string) => void;
  /** Clear all state */
  reset: () => void;
}

export type PotreeViewerStore = PotreeViewerState & PotreeViewerActions;

// ============================================
// Hook Return Types
// ============================================

export interface UsePotreeViewerReturn {
  /** The Potree viewer instance */
  viewer: Potree.Viewer | null;
  /** Whether the viewer is loading */
  isLoading: boolean;
  /** Whether scripts are loaded */
  scriptsLoaded: boolean;
  /** Error if any */
  error: Error | null;
  /** Load a point cloud */
  loadPointCloud: (config: PointCloudConfig) => Promise<Potree.LoadPointCloudResult>;
  /** Get a loaded point cloud by name */
  getPointCloud: (name: string) => Potree.PointCloudOctree | undefined;
  /** Fit camera to view all point clouds */
  fitToScreen: () => void;
  /** Set viewer background */
  setBackground: (bg: PotreeViewerConfig['background']) => void;
  /** Toggle sidebar visibility */
  toggleSidebar: () => void;
}

// ============================================
// Utility Types
// ============================================

export type ScriptLoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface ScriptInfo {
  src: string;
  status: ScriptLoadStatus;
  async?: boolean;
}

export interface StylesheetInfo {
  href: string;
  status: ScriptLoadStatus;
}

// ============================================
// Constants Types
// ============================================

export interface PotreeConstants {
  DEFAULT_CONFIG: Required<PotreeViewerConfig>;
  DEFAULT_POINT_CLOUD_CONFIG: Required<Omit<PointCloudConfig, 'url' | 'name'>>;
  SCRIPTS: readonly string[];
  STYLESHEETS: readonly string[];
}
