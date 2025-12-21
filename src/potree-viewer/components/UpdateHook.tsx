'use client';

/**
 * UpdateHook - Loads point clouds when URL or viewer changes
 * Uses refs for callbacks to avoid unnecessary effect re-runs
 */

import { useEffect, useRef } from 'react';
import { usePotreeStore } from '../store';
import type { PointCloudConfig } from '../types';

interface Props {
  pointClouds?: PointCloudConfig[];
  autoFocus?: boolean;
  onPointCloudLoaded?: (name: string, pointcloud: Potree.PointCloudOctree) => void;
}

export function UpdateHook({ pointClouds = [], autoFocus = true, onPointCloudLoaded }: Props) {
  const viewer = usePotreeStore((s) => s.viewer);
  const url = usePotreeStore((s) => s.url);
  const scriptsLoaded = usePotreeStore((s) => s.scriptsLoaded);
  const loadedRef = useRef<Set<string>>(new Set());

  // Stable refs for callbacks
  const autoFocusRef = useRef(autoFocus);
  const onLoadedRef = useRef(onPointCloudLoaded);
  autoFocusRef.current = autoFocus;
  onLoadedRef.current = onPointCloudLoaded;

  // Load single URL from store
  useEffect(() => {
    if (!scriptsLoaded || !viewer || !url) return;
    if (typeof window === 'undefined' || !window.Potree) return;
    if (loadedRef.current.has(url)) return;

    loadedRef.current.add(url);

    try {
      window.Potree.loadPointCloud(url, 'pointcloud', (e) => {
        if (!e || !e.pointcloud) {
          console.error('Failed to load point cloud:', url);
          return;
        }

        const pointcloud = e.pointcloud;
        const material = pointcloud.material;

        material.size = 0.6;
        material.pointSizeType = window.Potree.PointSizeType.ADAPTIVE;
        material.shape = window.Potree.PointShape.SQUARE;
        material.activeAttributeName = 'rgba';

        viewer.scene.addPointCloud(pointcloud);
        if (autoFocusRef.current) viewer.fitToScreen();
        onLoadedRef.current?.('pointcloud', pointcloud);
      });
    } catch (e) {
      console.error('Error loading point cloud:', e);
    }
  }, [scriptsLoaded, viewer, url]);

  // Load point clouds from props - use JSON.stringify for stable comparison
  const pointCloudsKey = JSON.stringify(pointClouds.map((pc) => pc.url));

  useEffect(() => {
    if (!scriptsLoaded || !viewer) return;
    if (typeof window === 'undefined' || !window.Potree) return;
    if (pointClouds.length === 0) return;

    pointClouds.forEach((pc) => {
      if (loadedRef.current.has(pc.url)) return;
      loadedRef.current.add(pc.url);

      try {
        window.Potree.loadPointCloud(pc.url, pc.name, (e) => {
          if (!e || !e.pointcloud) {
            console.error('Failed to load point cloud:', pc.url);
            return;
          }

          const pointcloud = e.pointcloud;
          const material = pointcloud.material;

          // Apply config
          material.size = pc.size ?? 0.6;
          material.pointSizeType =
            pc.sizeType === 'fixed'
              ? window.Potree.PointSizeType.FIXED
              : window.Potree.PointSizeType.ADAPTIVE;
          material.shape =
            pc.shape === 'circle'
              ? window.Potree.PointShape.CIRCLE
              : window.Potree.PointShape.SQUARE;
          material.activeAttributeName = pc.activeAttribute ?? 'rgba';

          if (pc.position) {
            pointcloud.position.set(
              pc.position.x ?? 0,
              pc.position.y ?? 0,
              pc.position.z ?? 0
            );
          }
          if (pc.visible !== undefined) {
            pointcloud.visible = pc.visible;
          }

          viewer.scene.addPointCloud(pointcloud);
          if (autoFocusRef.current) viewer.fitToScreen();
          onLoadedRef.current?.(pc.name, pointcloud);
        });
      } catch (e) {
        console.error('Error loading point cloud:', e);
      }
    });
  }, [scriptsLoaded, viewer, pointCloudsKey, pointClouds]);

  return null;
}
