import type { PotreeViewerConfig, CesiumConfig } from "./types";

export type PotreeViewerVariant =
  | "default"
  | "flood-simulation"
  | "terrain-analysis"
  | "minimal"
  | "presentation";

export interface VariantConfig {
  viewer?: Partial<PotreeViewerConfig>;
  cesium?: Partial<CesiumConfig>;
  sidebar?: boolean;
}

export const VARIANTS: Record<PotreeViewerVariant, VariantConfig> = {
  default: {
    viewer: {},
    cesium: { enabled: true },
    sidebar: true,
  },
  "flood-simulation": {
    viewer: {
      pointBudget: 2_000_000,
      edlEnabled: true,
      edlStrength: 0.5,
      controls: "orbit",
    },
    cesium: {
      enabled: true,
      mapProvider: "esri",
    },
    sidebar: true,
  },
  "terrain-analysis": {
    viewer: {
      pointBudget: 3_000_000,
      edlEnabled: true,
      edlRadius: 1.8,
      edlStrength: 0.6,
      controls: "orbit",
    },
    cesium: {
      enabled: true,
      mapProvider: "esri",
    },
    sidebar: true,
  },
  minimal: {
    viewer: {
      pointBudget: 1_000_000,
      edlEnabled: false,
      background: "gradient",
    },
    cesium: undefined,
    sidebar: false,
  },
  presentation: {
    viewer: {
      pointBudget: 5_000_000,
      edlEnabled: true,
      edlStrength: 0.7,
    },
    cesium: {
      enabled: true,
      mapProvider: "carto-dark-nolabels",
    },
    sidebar: false,
  },
};

export function getVariantConfig(variant?: PotreeViewerVariant): VariantConfig {
  return variant ? (VARIANTS[variant] ?? VARIANTS.default) : VARIANTS.default;
}

export function mergeVariantConfig(
  variant: PotreeViewerVariant | undefined,
  overrides: {
    config?: Partial<PotreeViewerConfig>;
    cesium?: Partial<CesiumConfig>;
    sidebar?: boolean;
  },
): VariantConfig {
  const base = getVariantConfig(variant);
  return {
    viewer: { ...base.viewer, ...overrides.config },
    cesium:
      base.cesium || overrides.cesium
        ? { ...base.cesium, ...overrides.cesium }
        : undefined,
    sidebar: overrides.sidebar ?? base.sidebar,
  };
}
