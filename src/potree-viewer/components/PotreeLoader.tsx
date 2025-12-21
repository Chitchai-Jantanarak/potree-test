'use client';

/**
 * PotreeLoader - Loads Potree scripts and stylesheets
 */

import { useEffect, useState, type ReactNode } from 'react';
import { usePotreeStore } from '../store';
import {
  DEFAULT_BASE_PATH,
  getScriptPaths,
  getStylesheetPaths,
  getCesiumScriptPath,
  getCesiumStylesheetPath,
  getCesiumBasePath,
} from '../constants';

interface Props {
  basePath?: string;
  includeCesium?: boolean;
  onError?: (error: Error) => void;
  children?: ReactNode;
}

const loadScript = (src: string): Promise<void> =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const el = document.createElement('script');
    el.src = src;
    el.async = false;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Failed: ${src}`));
    document.head.appendChild(el);
  });

const loadStyle = (href: string): Promise<void> =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`link[href="${href}"]`)) return resolve();
    const el = document.createElement('link');
    el.rel = 'stylesheet';
    el.href = href;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Failed: ${href}`));
    document.head.appendChild(el);
  });

export function PotreeLoader({ basePath = DEFAULT_BASE_PATH, includeCesium = false, onError, children }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const scriptsLoaded = usePotreeStore((s) => s.scriptsLoaded);
  const setScriptsLoaded = usePotreeStore((s) => s.setScriptsLoaded);
  const setStoreLoading = usePotreeStore((s) => s.setLoading);
  const setStoreError = usePotreeStore((s) => s.setError);

  useEffect(() => {
    if (scriptsLoaded) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setStoreLoading(true);
      try {
        // Load styles
        const styles = getStylesheetPaths(basePath);
        if (includeCesium) styles.push(getCesiumStylesheetPath(basePath));
        await Promise.all(styles.map(loadStyle));

        // Load Cesium first if needed
        if (includeCesium) {
          await loadScript(getCesiumScriptPath(basePath));
          window.Cesium?.buildModuleUrl.setBaseUrl(getCesiumBasePath(basePath) + '/');
        }

        // Load Potree scripts sequentially
        for (const src of getScriptPaths(basePath)) {
          if (cancelled) return;
          await loadScript(src);
        }

        if (!window.Potree) throw new Error('Potree not loaded');
        if (includeCesium && !window.Cesium) throw new Error('Cesium not loaded');

        if (!cancelled) {
          setScriptsLoaded(true);
          setStoreLoading(false);
          setLoading(false);
        }
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        if (!cancelled) {
          setError(err);
          setStoreError(err);
          setStoreLoading(false);
          setLoading(false);
          onError?.(err);
        }
      }
    };

    load();
    return () => { cancelled = true; };
  }, [basePath, includeCesium, scriptsLoaded, setScriptsLoaded, setStoreLoading, setStoreError]);

  if (error) {
    return <div style={{ color: 'red', padding: 20 }}>Error: {error.message}</div>;
  }

  if (loading) {
    return <div style={{ padding: 20 }}>Loading Potree...</div>;
  }

  return <>{children}</>;
}
