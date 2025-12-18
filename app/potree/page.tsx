'use client';

/**
 * Potree Demo Page
 * Example usage of the Potree viewer in Next.js
 */

import { useCallback, useState } from 'react';
import {
  PotreeProvider,
  PotreeLoader,
  PotreeViewer,
  usePotreeViewer,
} from '@/src/potree-viewer';
import '@/src/potree-viewer/styles/potree-viewer.css';

// ============================================
// Controls Component
// ============================================

function ViewerControls() {
  const { viewer, fitToScreen, toggleSidebar, setBackground } = usePotreeViewer();

  if (!viewer) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        zIndex: 1000,
        display: 'flex',
        gap: 8,
      }}
    >
      <button
        onClick={fitToScreen}
        style={{
          padding: '8px 16px',
          background: '#333',
          color: '#fff',
          border: '1px solid #555',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        Fit to Screen
      </button>
      <button
        onClick={toggleSidebar}
        style={{
          padding: '8px 16px',
          background: '#333',
          color: '#fff',
          border: '1px solid #555',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        Toggle Sidebar
      </button>
      <button
        onClick={() => setBackground('skybox')}
        style={{
          padding: '8px 16px',
          background: '#333',
          color: '#fff',
          border: '1px solid #555',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        Skybox BG
      </button>
      <button
        onClick={() => setBackground(null)}
        style={{
          padding: '8px 16px',
          background: '#333',
          color: '#fff',
          border: '1px solid #555',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        No BG
      </button>
    </div>
  );
}

// ============================================
// Info Panel Component
// ============================================

function InfoPanel() {
  const { viewer, scriptsLoaded, isLoading, error } = usePotreeViewer();

  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1000,
        padding: 16,
        background: 'rgba(0,0,0,0.7)',
        color: '#fff',
        borderRadius: 8,
        fontSize: 14,
        maxWidth: 300,
      }}
    >
      <h3 style={{ margin: '0 0 12px 0' }}>Potree Viewer Status</h3>
      <div style={{ marginBottom: 8 }}>
        <strong>Scripts:</strong> {scriptsLoaded ? 'Loaded' : 'Loading...'}
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>Viewer:</strong> {viewer ? 'Ready' : 'Initializing...'}
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
      </div>
      {error && (
        <div style={{ color: '#ff4444' }}>
          <strong>Error:</strong> {error.message}
        </div>
      )}
    </div>
  );
}

// ============================================
// Main Demo Page
// ============================================

export default function PotreeDemoPage() {
  const [showInfo, setShowInfo] = useState(true);

  const handleReady = useCallback((viewer: Potree.Viewer) => {
    console.log('Potree viewer is ready!', viewer);
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error('Potree error:', error);
  }, []);

  const handlePointCloudLoaded = useCallback(
    (name: string, result: Potree.LoadPointCloudResult) => {
      console.log(`Point cloud loaded: ${name}`, result);
    },
    []
  );

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <PotreeProvider>
        <PotreeLoader
          basePath="/potree-static"
          onLoad={() => console.log('Scripts loaded!')}
          onError={handleError}
          loadingComponent={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                background: '#1a1a1a',
                color: '#fff',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 16 }}>Loading Potree...</div>
                <div style={{ color: '#888' }}>Please wait while scripts are loaded</div>
              </div>
            </div>
          }
        >
          <PotreeViewer
            config={{
              fov: 60,
              pointBudget: 1_000_000,
              edlEnabled: false,
              background: null,
              controls: 'earth',
              language: 'en',
              showGUI: true,
              showSidebar: true,
            }}
            // Add your point cloud URLs here
            // pointClouds={[
            //   {
            //     url: '/path/to/your/pointcloud/metadata.json',
            //     name: 'myPointCloud',
            //     size: 1,
            //     sizeType: 'adaptive',
            //     shape: 'square',
            //   },
            // ]}
            pointClouds={[]}
            onReady={handleReady}
            onPointCloudLoaded={handlePointCloudLoaded}
            onError={handleError}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Custom overlay components */}
            {showInfo && <InfoPanel />}
            <ViewerControls />

            {/* Toggle info button */}
            <button
              onClick={() => setShowInfo(!showInfo)}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                zIndex: 1000,
                padding: '8px 16px',
                background: '#333',
                color: '#fff',
                border: '1px solid #555',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              {showInfo ? 'Hide Info' : 'Show Info'}
            </button>
          </PotreeViewer>
        </PotreeLoader>
      </PotreeProvider>
    </div>
  );
}
