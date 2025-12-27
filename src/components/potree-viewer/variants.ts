import type { PotreeViewerConfig, CesiumConfig } from "./types";

export type PotreeViewerVariant = "default";

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
