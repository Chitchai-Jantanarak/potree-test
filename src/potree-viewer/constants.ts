import type {
  PotreeViewerConfig,
  CesiumConfig,
  MapProviderConfig,
  ProjectionConfig,
} from "./types";

export const BASE_PATH = "/potree-static";

export const CONTAINER_IDS = {
  renderArea: "potree_render_area",
  sidebar: "potree_sidebar_container",
  cesium: (id: string) => `cesium_container_${id}`,
} as const;

export const DEFAULT_VIEWER_CONFIG: PotreeViewerConfig = {
  fov: 60,
  pointBudget: 1_000_000,
  edlEnabled: true,
  edlRadius: 1.4,
  edlStrength: 0.4,
  background: null,
  controls: "orbit",
  moveSpeed: 1_000,
};

export const DEFAULT_CESIUM_CONFIG: CesiumConfig = {
  enabled: true,
  projection: "mercator",
  offsetZ: 0,
  mapProvider: "osm",
};

export const SCRIPTS = {
  potree: [
    `${BASE_PATH}/lib/jquery/jquery-3.1.1.min.js`,
    `${BASE_PATH}/lib/proj4/proj4.js`,
    `${BASE_PATH}/lib/other/BinaryHeap.js`,
    `${BASE_PATH}/lib/tween/tween.min.js`,
    `${BASE_PATH}/lib/i18next/i18next.js`,
    `${BASE_PATH}/lib/d3/d3.js`,
    `${BASE_PATH}/lib/jstree/jstree.js`,
    `${BASE_PATH}/lib/spectrum/spectrum.js`,
    `${BASE_PATH}/lib/jquery-ui/jquery-ui.min.js`,
    `${BASE_PATH}/lib/three.js/build/three.js`,
    `${BASE_PATH}/lib/copc/index.js`,
    `${BASE_PATH}/build/potree/potree.js`,
  ],
  cesium: `${BASE_PATH}/lib/Cesium/Cesium.js`,
} as const;

export const STYLES = {
  potree: [
    `${BASE_PATH}/build/potree/potree.css`,
    `${BASE_PATH}/lib/jquery-ui/jquery-ui.css`,
    `${BASE_PATH}/lib/spectrum/spectrum.css`,
    `${BASE_PATH}/lib/jstree/themes/mixed/style.css`,
  ],
  cesium: `${BASE_PATH}/lib/Cesium/Widgets/widgets.css`,
} as const;

export const CESIUM_BASE_PATH = `${BASE_PATH}/lib/Cesium`;

export const MAP_PROVIDERS: Record<string, MapProviderConfig> = {
  osm: { type: "osm", url: "https://a.tile.openstreetmap.org/" },
  esri: {
    type: "arcgis",
    url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
  },
  "carto-voyager": {
    type: "url",
    url: "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
  },
  "carto-voyager-nolabels": {
    type: "url",
    url: "https://basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png",
  },
  "carto-positron": {
    type: "url",
    url: "https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png",
  },
  "carto-positron-nolabels": {
    type: "url",
    url: "https://basemaps.cartocdn.com/rastertiles/light_nolabels/{z}/{x}/{y}.png",
  },
  "carto-dark": {
    type: "url",
    url: "https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png",
  },
  "carto-dark-nolabels": {
    type: "url",
    url: "https://basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}.png",
  },
};

export const PROJECTIONS: Record<string, ProjectionConfig> = {
  mercator: {
    proj4: "EPSG:3857",
  },
  utm10: {
    proj4: "+proj=utm +zone=10 +datum=WGS84 +units=m +no_defs",
  },
  utm47: {
    proj4: "+proj=utm +zone=47 +datum=WGS84 +units=m +no_defs",
  },
  utm48: {
    proj4: "+proj=utm +zone=48 +datum=WGS84 +units=m +no_defs",
  },
};

export const WGS84 = "+proj=longlat +datum=WGS84 +no_defs";
