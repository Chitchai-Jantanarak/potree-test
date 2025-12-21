/**
 * Potree Viewer Constants
 */

export const DEFAULT_BASE_PATH = '/potree-static';

// Scripts (order matters - dependencies first)
// CRITICAL: Three.js MUST be loaded before potree.js
export const getScriptPaths = (basePath = DEFAULT_BASE_PATH) => [
  `${basePath}/lib/jquery/jquery-3.1.1.min.js`,
  `${basePath}/lib/proj4/proj4.js`,
  `${basePath}/lib/other/BinaryHeap.js`,
  `${basePath}/lib/tween/tween.min.js`,
  `${basePath}/lib/i18next/i18next.js`,
  `${basePath}/lib/d3/d3.js`,
  `${basePath}/lib/jstree/jstree.js`,
  `${basePath}/lib/spectrum/spectrum.js`,
  `${basePath}/lib/jquery-ui/jquery-ui.min.js`,
  `${basePath}/lib/three.js/build/three.js`,
  `${basePath}/build/potree/potree.js`,
];

// Stylesheets
export const getStylesheetPaths = (basePath = DEFAULT_BASE_PATH) => [
  `${basePath}/build/potree/potree.css`,
  `${basePath}/lib/jquery-ui/jquery-ui.css`,
  `${basePath}/lib/spectrum/spectrum.css`,
  `${basePath}/lib/jstree/themes/mixed/style.css`,
  `${basePath}/lib/openlayers3/ol.css`,
];

// Cesium paths
export const getCesiumScriptPath = (basePath = DEFAULT_BASE_PATH) =>
  `${basePath}/lib/Cesium/Cesium.js`;

export const getCesiumStylesheetPath = (basePath = DEFAULT_BASE_PATH) =>
  `${basePath}/lib/Cesium/Widgets/widgets.css`;

export const getCesiumBasePath = (basePath = DEFAULT_BASE_PATH) =>
  `${basePath}/lib/Cesium`;

// Map providers (free, no API key)
export const MAP_PROVIDERS = {
  osm: { name: 'OpenStreetMap', url: 'https://tile.openstreetmap.org/', type: 'osm' as const },
  esri: { name: 'ESRI Satellite', url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer', type: 'arcgis' as const },
};

export type MapProvider = keyof typeof MAP_PROVIDERS;

// Default locations
export const DEFAULT_LOCATIONS = {
  sanFrancisco: { lon: -122.4194, lat: 37.7749, height: 50000 },
  newYork: { lon: -74.006, lat: 40.7128, height: 50000 },
  tokyo: { lon: 139.6917, lat: 35.6895, height: 50000 },
};

export type LocationName = keyof typeof DEFAULT_LOCATIONS;
