"use client";

import { useMemo, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PotreeProvider } from "./store";
import { ScriptLoader } from "./_internal/ScriptLoader";
import { ViewerContainer } from "./_internal/ViewerContainer";
import { ViewerInitializer } from "./_internal/ViewerInitializer";
import { CesiumLayer } from "./_internal/CesiumLayer";
import { mergeVariantConfig, type PotreeViewerVariant } from "./variants";
import { CONTAINER_IDS } from "./constants";
import type { PotreeViewerProps } from "./types";
import "./styles.css";

export function PotreeViewer({
  variant,
  containerId = CONTAINER_IDS.renderArea,
  config,
  cesium,
  sidebar,
  className,
  style,
  children,
  onReady,
  onError,
}: PotreeViewerProps): ReactNode {
  const merged = useMemo(
    () =>
      mergeVariantConfig(variant as PotreeViewerVariant, {
        config,
        cesium,
        sidebar,
      }),
    [variant, config, cesium, sidebar],
  );

  const hasCesium =
    merged.cesium?.enabled !== false && merged.cesium !== undefined;
  const showSidebar = merged.sidebar ?? false;

  return (
    <div
      className={cn("relative h-full w-full overflow-hidden", className)}
      style={style}
    >
      <PotreeProvider
        containerId={containerId}
        projection={merged.cesium?.projection}
        offsetZ={merged.cesium?.offsetZ}
      >
        <ScriptLoader includeCesium={hasCesium} onError={onError}>
          <ViewerContainer hasCesium={hasCesium} sidebar={showSidebar}>
            {children}
          </ViewerContainer>
          <ViewerInitializer
            config={merged.viewer || {}}
            sidebar={showSidebar}
            hasCesium={hasCesium}
            onReady={hasCesium ? undefined : (v) => onReady?.(v)}
          />
          {hasCesium && (
            <CesiumLayer config={merged.cesium || {}} onReady={onReady} />
          )}
        </ScriptLoader>
      </PotreeProvider>
    </div>
  );
}
