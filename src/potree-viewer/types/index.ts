/**
 * Potree Viewer Types
 */

/// <reference path="./globals.d.ts" />

import type { ReactNode, CSSProperties } from 'react';

// UTM Zone types
export type UTMZone = '47' | '48';

// Background types
export type Background = 'skybox' | 'gradient' | 'black' | 'white' | null;

// Point cloud configuration
export interface PointCloudConfig {
  url: string;
  name: string;
  position?: { x?: number; y?: number; z?: number };
  rotation?: { x?: number; y?: number; z?: number };
  scale?: { x?: number; y?: number; z?: number };
  visible?: boolean;
  size?: number;
  sizeType?: 'adaptive' | 'fixed';
  shape?: 'square' | 'circle';
  activeAttribute?: 'rgba' | 'elevation' | 'intensity';
}

// Viewer configuration
export interface PotreeViewerConfig {
  fov?: number;
  pointBudget?: number;
  background?: Background;
  edlEnabled?: boolean;
  edlRadius?: number;
  edlStrength?: number;
  showGUI?: boolean;
  showSidebar?: boolean;
  controls?: 'orbit' | 'earth' | 'fly';
}

// Cesium configuration
export interface CesiumConfig {
  enabled?: boolean;
  zone?: UTMZone;
  offsetZ?: number;
  mapProvider?: 'osm' | 'esri';
  initialPosition?: {
    lon: number;
    lat: number;
    height: number;
  };
}

// Main viewer props
export interface PotreeViewerProps {
  // Point cloud URL (single)
  url?: string;

  // Container ID
  containerId?: string;

  // Viewer config
  config?: PotreeViewerConfig;

  // Cesium config (pass to enable Cesium)
  cesium?: CesiumConfig;

  // Point clouds to load
  pointClouds?: PointCloudConfig[];

  // Sidebar
  sidebar?: boolean;

  // Auto focus on loaded point clouds
  autoFocus?: boolean;

  // Styling
  className?: string;
  style?: CSSProperties;

  // Children in render area (overlays on the viewer)
  renderAreaChildren?: ReactNode;

  // Additional children (sidebar, controls, etc.)
  children?: ReactNode;

  // Callbacks
  onReady?: (viewer: Potree.Viewer, cesiumViewer?: Cesium.Viewer) => void;
  onPointCloudLoaded?: (name: string, pointcloud: Potree.PointCloudOctree) => void;
  onError?: (error: Error) => void;
}

// Store state
export interface PotreeStore {
  // Viewers
  viewer: Potree.Viewer | null;
  cesiumViewer: Cesium.Viewer | null;

  // Loading states
  scriptsLoaded: boolean;
  isLoading: boolean;
  error: Error | null;

  // Config
  containerId: string;
  url: string | null;
  zone: UTMZone;
  offsetZ: number;

  // Actions
  setViewer: (viewer: Potree.Viewer | null) => void;
  setCesiumViewer: (viewer: Cesium.Viewer | null) => void;
  setScriptsLoaded: (loaded: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setUrl: (url: string | null) => void;
  setContainerId: (id: string) => void;
  setZone: (zone: UTMZone) => void;
  setOffsetZ: (offset: number) => void;
  reset: () => void;
}
