'use client';

/**
 * Cesium + Potree Example
 *
 * Features:
 * - Orbit controls for Potree viewer
 * - Point cloud loading
 * - KML boundary loading via Cesium
 * - 3D model loading via Cesium
 * - Camera positioned at area of interest
 */

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';

// Dynamic import to avoid SSR issues
const PotreeViewer = dynamic(
  () => import('@/src/potree-viewer').then((mod) => mod.PotreeViewer),
  { ssr: false, loading: () => <div style={{ padding: 20 }}>Loading...</div> }
);

// Configuration - adjust these for your data
const CONFIG = {
  // Your point cloud metadata.json URL
  pointCloudUrl: '/pointclouds/metadata.json',

  // KML boundary file URL
  kmlUrl: '/data/boundary.kml',

  // 3D model (glTF/glb) URL
  modelUrl: '/models/building.glb',

  // Area of interest coordinates (Thailand example - UTM Zone 47)
  areaOfInterest: {
    lon: 100.5,    // Longitude
    lat: 13.75,    // Latitude
    height: 1000,  // Camera height in meters
  },

  // UTM Zone for coordinate conversion
  utmZone: '47' as const,
};

export default function CesiumExample() {
  const [status, setStatus] = useState<string>('Initializing...');

  const handleReady = useCallback((viewer: Potree.Viewer, cesiumViewer?: Cesium.Viewer) => {
    console.log('Potree viewer ready:', !!viewer);
    console.log('Cesium viewer ready:', !!cesiumViewer);
    setStatus('Viewers ready');

    if (!viewer || !cesiumViewer) return;

    const Cesium = window.Cesium;
    if (!Cesium) return;

    // === Load KML Boundary ===
    // Uncomment when you have a KML file
    /*
    try {
      const kmlDataSource = Cesium.KmlDataSource.load(CONFIG.kmlUrl, {
        camera: cesiumViewer.scene.camera,
        canvas: cesiumViewer.scene.canvas,
        clampToGround: true,
      });

      cesiumViewer.dataSources.add(kmlDataSource).then((dataSource) => {
        // Fly to KML boundary
        cesiumViewer.flyTo(dataSource, {
          duration: 2,
        });
        setStatus('KML boundary loaded');
        console.log('KML loaded:', dataSource.name);
      });
    } catch (e) {
      console.warn('KML loading skipped:', e);
    }
    */

    // === Load 3D Model (glTF/glb) ===
    // Uncomment when you have a 3D model file
    /*
    try {
      const modelPosition = Cesium.Cartesian3.fromDegrees(
        CONFIG.areaOfInterest.lon,
        CONFIG.areaOfInterest.lat,
        0 // height above ground
      );

      const heading = Cesium.Math.toRadians(0);
      const pitch = 0;
      const roll = 0;
      const orientation = Cesium.Transforms.headingPitchRollQuaternion(
        modelPosition,
        new Cesium.HeadingPitchRoll(heading, pitch, roll)
      );

      cesiumViewer.entities.add({
        name: '3D Model',
        position: modelPosition,
        orientation: orientation,
        model: {
          uri: CONFIG.modelUrl,
          scale: 1.0,
          minimumPixelSize: 64,
          maximumScale: 1000,
        },
      });

      console.log('3D model added');
      setStatus('3D model loaded');
    } catch (e) {
      console.warn('3D model loading skipped:', e);
    }
    */

    // === Set Camera to Area of Interest ===
    const destination = Cesium.Cartesian3.fromDegrees(
      CONFIG.areaOfInterest.lon,
      CONFIG.areaOfInterest.lat,
      CONFIG.areaOfInterest.height
    );

    cesiumViewer.camera.setView({
      destination,
    });

    setStatus('Ready - Camera at area of interest');
  }, []);

  const handlePointCloudLoaded = useCallback((name: string, _pointcloud: Potree.PointCloudOctree) => {
    console.log('Point cloud loaded:', name);
    setStatus(`Point cloud "${name}" loaded`);
  }, []);

  const handleError = useCallback((err: Error) => {
    console.error('Error:', err);
    setStatus(`Error: ${err.message}`);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <PotreeViewer
        sidebar
        config={{
          pointBudget: 1_000_000,
          edlEnabled: true,
          fov: 60,
          controls: 'orbit', // Orbit controls for Potree
        }}
        cesium={{
          enabled: true,
          zone: CONFIG.utmZone,
          offsetZ: 0,
          mapProvider: 'osm',
          initialPosition: CONFIG.areaOfInterest,
        }}
        // Uncomment to load point clouds
        // pointClouds={[
        //   {
        //     url: CONFIG.pointCloudUrl,
        //     name: 'Main Point Cloud',
        //     size: 0.8,
        //     sizeType: 'adaptive',
        //     shape: 'square',
        //     activeAttribute: 'rgba',
        //   },
        // ]}
        autoFocus={true}
        onReady={handleReady}
        onPointCloudLoaded={handlePointCloudLoaded}
        onError={handleError}
        renderAreaChildren={
          <div
            style={{
              position: 'absolute',
              top: 20,
              left: 320,
              zIndex: 1000,
              padding: 16,
              background: 'rgba(0,0,0,0.85)',
              borderRadius: 8,
              color: '#fff',
              maxWidth: 350,
            }}
          >
            <h3 style={{ margin: '0 0 12px 0' }}>Cesium + Potree</h3>
            <div style={{ fontSize: 12, marginBottom: 8 }}>
              <strong>Status:</strong> {status}
            </div>
            <div style={{ fontSize: 11, color: '#888', lineHeight: 1.5 }}>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>Controls:</strong> Orbit mode enabled
              </p>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>Features:</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                <li>Point cloud overlay on globe</li>
                <li>KML boundary loading</li>
                <li>3D model (glTF) loading</li>
                <li>Camera sync: Potree → Cesium</li>
              </ul>
            </div>
          </div>
        }
      />
    </div>
  );
}
