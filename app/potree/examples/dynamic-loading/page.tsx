'use client';

/**
 * Dynamic Point Cloud Loading Example
 * Shows how to load point clouds dynamically using hooks
 */

import { useState } from 'react';
import {
  PotreeProvider,
  PotreeLoader,
  PotreeViewer,
  usePotreeViewer,
} from '@/src/potree-viewer';
import type { PointCloudConfig } from '@/src/potree-viewer';

// ============================================
// Dynamic Loader Component
// ============================================

function DynamicLoader() {
  const { viewer, loadPointCloud, fitToScreen } = usePotreeViewer();
  const [url, setUrl] = useState('');
  const [name, setName] = useState('pointcloud-1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoad = async () => {
    if (!url || !viewer) return;

    setLoading(true);
    setError(null);

    try {
      const config: PointCloudConfig = {
        url,
        name,
        size: 1,
        sizeType: 'adaptive',
        shape: 'square',
      };

      await loadPointCloud(config);
      fitToScreen();
      setUrl('');
      setName(`pointcloud-${Date.now()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1000,
        padding: 20,
        background: 'rgba(0,0,0,0.8)',
        borderRadius: 8,
        color: '#fff',
        maxWidth: 400,
      }}
    >
      <h3 style={{ margin: '0 0 16px 0' }}>Load Point Cloud</h3>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>
          Metadata URL:
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/path/to/metadata.json"
          style={{
            width: '100%',
            padding: 8,
            border: '1px solid #555',
            borderRadius: 4,
            background: '#222',
            color: '#fff',
          }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>
          Name:
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: '100%',
            padding: 8,
            border: '1px solid #555',
            borderRadius: 4,
            background: '#222',
            color: '#fff',
          }}
        />
      </div>

      <button
        onClick={handleLoad}
        disabled={loading || !url || !viewer}
        style={{
          width: '100%',
          padding: '10px 16px',
          background: loading ? '#555' : '#0066cc',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Loading...' : 'Load Point Cloud'}
      </button>

      {error && (
        <div style={{ marginTop: 12, color: '#ff4444', fontSize: 12 }}>
          Error: {error}
        </div>
      )}

      <div style={{ marginTop: 16, fontSize: 12, color: '#888' }}>
        <strong>Tip:</strong> Point clouds should be converted to Potree format
        using PotreeConverter. The URL should point to the metadata.json file.
      </div>
    </div>
  );
}

// ============================================
// Main Page
// ============================================

export default function DynamicLoadingExample() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <PotreeProvider>
        <PotreeLoader basePath="/potree-static">
          <PotreeViewer
            config={{
              fov: 60,
              pointBudget: 1_000_000,
              showGUI: true,
            }}
            style={{ width: '100%', height: '100%' }}
          >
            <DynamicLoader />
          </PotreeViewer>
        </PotreeLoader>
      </PotreeProvider>
    </div>
  );
}
