/// <reference path="./globals.d.ts" />

import type { CSSProperties, ReactNode } from "react";

export type UTMZone = "10" | "47" | "48";
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

export interface UTMZoneConfig {
  centralMeridian: number;
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

export interface GeoPosition {
  longitude: number;
  latitude: number;
  height?: number;
}

export interface CesiumConfig {
  enabled: boolean;
  zone: UTMZone;
  offsetZ: number;
  mapProvider: MapProvider;
  position?: GeoPosition;
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
  zone: UTMZone;
  offsetZ: number;
  position: GeoPosition | null;
  setViewer: (viewer: Potree.Viewer | null) => void;
  setCesiumViewer: (viewer: Cesium.Viewer | null) => void;
  setScriptsLoaded: (loaded: boolean) => void;
}
