"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePotreeStore } from "../store";
import { SCRIPTS, STYLES } from "../constants";

interface ScriptLoaderProps {
  includeCesium: boolean;
  children: ReactNode;
  onError?: (error: Error) => void;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = new URL(src, document.baseURI).href;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load: ${src}`));
    document.head.appendChild(script);
  });
}

function loadStylesheet(href: string): void {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL(href, document.baseURI).href;
  document.head.appendChild(link);
}

export function ScriptLoader({
  includeCesium,
  children,
  onError,
}: ScriptLoaderProps): ReactNode {
  const [loaded, setLoaded] = useState(false);
  const setScriptsLoaded = usePotreeStore((s) => s.setScriptsLoaded);

  useEffect(() => {
    if (loaded) return;

    const loadAll = async () => {
      try {
        STYLES.potree.forEach(loadStylesheet);
        if (includeCesium) loadStylesheet(STYLES.cesium);

        for (const src of SCRIPTS.potree) {
          await loadScript(src);
        }
        if (includeCesium) {
          await loadScript(SCRIPTS.cesium);
        }

        setLoaded(true);
        setScriptsLoaded(true);
      } catch (err) {
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    };

    loadAll();
  }, [loaded, includeCesium, setScriptsLoaded, onError]);

  if (!loaded) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#1a1a2e] text-white">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
