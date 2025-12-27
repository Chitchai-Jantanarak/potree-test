/// <reference path="./globals.d.ts" />

import type { CSSProperties, ReactNode } from "react";

export type Projection = "mercator" | "utm10" | "utm47" | "utm48";
export type BackgroundType = "skybox" | "gradient" | "black" | "white" | null;
export type ControlType = "orbit" | "earth" | "fly";
export type MapProvider =
  | "osm"
  | "esri"
  | "carto-voyager"
  | "carto-voyager-nolabels"
  | "carto-positron"
  | "carto-positron-nolabels"
  | "carto-dark"
  | "carto-dark-nolabels";

export interface MapProviderConfig {
  type: "osm" | "arcgis" | "url";
  url: string;
}

export interface ProjectionConfig {
  proj4: string;
}

export interface PotreeViewerConfig {
  fov: number;
  pointBudget: number;
  edlEnabled: boolean;
  edlRadius: number;
  edlStrength: number;
  background: BackgroundType;
  controls: ControlType;
  moveSpeed: number;
}

export interface CesiumConfig {
  enabled: boolean;
  projection: Projection;
  offsetZ: number;
  mapProvider: MapProvider;
}

export interface PotreeViewerProps {
  variant?: string;
  containerId?: string;
  config?: Partial<PotreeViewerConfig>;
  cesium?: Partial<CesiumConfig>;
  sidebar?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  onReady?: (viewer: Potree.Viewer, cesiumViewer?: Cesium.Viewer) => void;
  onError?: (error: Error) => void;
}

export interface PotreeStoreState {
  viewer: Potree.Viewer | null;
  cesiumViewer: Cesium.Viewer | null;
  scriptsLoaded: boolean;
  containerId: string;
  projection: Projection;
  offsetZ: number;
  setViewer: (viewer: Potree.Viewer | null) => void;
  setCesiumViewer: (viewer: Cesium.Viewer | null) => void;
  setScriptsLoaded: (loaded: boolean) => void;
}
