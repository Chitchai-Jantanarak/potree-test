'use client';

/**
 * PotreeLoader Component
 * Handles loading of Potree static scripts and stylesheets in the correct order
 */

import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { usePotreeStore } from '../store';
import {
  DEFAULT_BASE_PATH,
  getScriptPaths,
  getStylesheetPaths,
} from '../constants';

// ============================================
// Types
// ============================================

export interface PotreeLoaderProps {
  /** Base path for static assets (default: /potree-static) */
  basePath?: string;
  /** Callback when all scripts are loaded */
  onLoad?: () => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Show loading indicator */
  showLoading?: boolean;
  /** Loading component */
  loadingComponent?: ReactNode;
  /** Children to render after loading */
  children?: ReactNode;
}

// ============================================
// Script Loading Utilities
// ============================================

/**
 * Load a single script and return a promise
 */
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = false; // Important: maintain load order

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

    document.head.appendChild(script);
  });
};

/**
 * Load a single stylesheet and return a promise
 */
const loadStylesheet = (href: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if stylesheet already exists
    const existing = document.querySelector(`link[href="${href}"]`);
    if (existing) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = href;

    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`));

    document.head.appendChild(link);
  });
};

/**
 * Load all scripts sequentially (order matters!)
 */
const loadScriptsSequentially = async (scripts: readonly string[]): Promise<void> => {
  for (const script of scripts) {
    await loadScript(script);
  }
};

/**
 * Load all stylesheets in parallel
 */
const loadStylesheetsParallel = async (stylesheets: readonly string[]): Promise<void> => {
  await Promise.all(stylesheets.map(loadStylesheet));
};

// ============================================
// Component
// ============================================

export function PotreeLoader({
  basePath = DEFAULT_BASE_PATH,
  onLoad,
  onError,
  showLoading = true,
  loadingComponent,
  children,
}: PotreeLoaderProps) {
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState<Error | null>(null);

  const scriptsLoaded = usePotreeStore((s) => s.scriptsLoaded);
  const setScriptsLoaded = usePotreeStore((s) => s.setScriptsLoaded);
  const setLoading = usePotreeStore((s) => s.setLoading);
  const setError = usePotreeStore((s) => s.setError);

  const loadAllAssets = useCallback(async () => {
    // Skip if already loaded
    if (scriptsLoaded || typeof window === 'undefined') {
      setLocalLoading(false);
      return;
    }

    setLoading(true);
    setLocalLoading(true);

    try {
      const scripts = getScriptPaths(basePath);
      const stylesheets = getStylesheetPaths(basePath);

      // Load stylesheets first (parallel)
      await loadStylesheetsParallel(stylesheets);

      // Load scripts sequentially (order matters for dependencies)
      await loadScriptsSequentially(scripts);

      // Verify Potree is available
      if (typeof window.Potree === 'undefined') {
        throw new Error(
          'Potree failed to initialize. Check that potree.js is correctly loaded.'
        );
      }

      setScriptsLoaded(true);
      setLoading(false);
      setLocalLoading(false);
      setError(null);
      setLocalError(null);

      onLoad?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLocalError(error);
      setLoading(false);
      setLocalLoading(false);

      onError?.(error);
    }
  }, [basePath, scriptsLoaded, setScriptsLoaded, setLoading, setError, onLoad, onError]);

  useEffect(() => {
    loadAllAssets();
  }, [loadAllAssets]);

  // Error state
  if (localError) {
    return (
      <div className="potree-loader-error" style={{ padding: '20px', color: 'red' }}>
        <h3>Failed to load Potree</h3>
        <p>{localError.message}</p>
        <button onClick={() => loadAllAssets()}>Retry</button>
      </div>
    );
  }

  // Loading state
  if (localLoading && !scriptsLoaded) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    if (showLoading) {
      return (
        <div
          className="potree-loader-loading"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <span>Loading Potree...</span>
        </div>
      );
    }

    return null;
  }

  // Loaded - render children
  return <>{children}</>;
}

export default PotreeLoader;
