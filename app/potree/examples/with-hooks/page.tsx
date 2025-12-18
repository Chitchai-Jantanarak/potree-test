'use client';

/**
 * Potree with Hooks Example
 * Shows how to use the usePointCloud hook for fine-grained control
 */

import { useState } from 'react';
import {
  PotreeProvider,
  PotreeLoader,
  PotreeViewer,
  usePointCloud,
  usePotreeViewer,
} from '@/src/potree-viewer';

// ============================================
// Point Cloud Control Panel
// ============================================

interface PointCloudControlProps {
  url: string;
  name: string;
}

function PointCloudControl({ url, name }: PointCloudControlProps) {
  const {
    pointCloud,
    isLoading,
    error,
    load,
    unload,
    setVisible,
    setOpacity,
    setPointSize,
    fitToView,
  } = usePointCloud({
    url,
    name,
    autoLoad: false, // We'll load manually
    autoFit: true,
  });

  const [opacity, setLocalOpacity] = useState(1);
  const [size, setLocalSize] = useState(1);

  const handleOpacityChange = (value: number) => {
    setLocalOpacity(value);
    setOpacity(value);
  };

  const handleSizeChange = (value: number) => {
    setLocalSize(value);
    setPointSize(value);
  };

  return (
    <div
      style={{
        padding: 16,
        background: 'rgba(0,0,0,0.7)',
        borderRadius: 8,
        marginBottom: 12,
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{name}</div>

      {isLoading && <div style={{ color: '#888' }}>Loading...</div>}

      {error && (
        <div style={{ color: '#ff4444', fontSize: 12 }}>{error.message}</div>
      )}

      {!pointCloud && !isLoading && (
        <button
          onClick={load}
          style={{
            padding: '6px 12px',
            background: '#0066cc',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Load
        </button>
      )}

      {pointCloud && (
        <div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12 }}>Opacity: {opacity.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12 }}>Point Size: {size}</label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={size}
              onChange={(e) => handleSizeChange(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setVisible(true)}
              style={{
                padding: '4px 8px',
                background: '#333',
                color: '#fff',
                border: '1px solid #555',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              Show
            </button>
            <button
              onClick={() => setVisible(false)}
              style={{
                padding: '4px 8px',
                background: '#333',
                color: '#fff',
                border: '1px solid #555',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              Hide
            </button>
            <button
              onClick={fitToView}
              style={{
                padding: '4px 8px',
                background: '#333',
                color: '#fff',
                border: '1px solid #555',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              Fit
            </button>
            <button
              onClick={unload}
              style={{
                padding: '4px 8px',
                background: '#cc0000',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              Unload
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Control Panel
// ============================================

function ControlPanel() {
  const { viewer, scriptsLoaded } = usePotreeViewer();
  const [clouds, setClouds] = useState<Array<{ url: string; name: string }>>([]);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');

  const addCloud = () => {
    if (newUrl && newName) {
      setClouds([...clouds, { url: newUrl, name: newName }]);
      setNewUrl('');
      setNewName('');
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1000,
        color: '#fff',
        width: 320,
      }}
    >
      <div
        style={{
          padding: 16,
          background: 'rgba(0,0,0,0.8)',
          borderRadius: 8,
          marginBottom: 12,
        }}
      >
        <h3 style={{ margin: '0 0 12px 0' }}>Potree Hook Example</h3>
        <div style={{ fontSize: 12, color: '#888' }}>
          Scripts: {scriptsLoaded ? 'Loaded' : 'Loading...'}
          <br />
          Viewer: {viewer ? 'Ready' : 'Initializing...'}
        </div>
      </div>

      <div
        style={{
          padding: 16,
          background: 'rgba(0,0,0,0.8)',
          borderRadius: 8,
          marginBottom: 12,
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Add Point Cloud</div>
        <input
          type="text"
          placeholder="URL to metadata.json"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          style={{
            width: '100%',
            padding: 6,
            marginBottom: 8,
            background: '#222',
            border: '1px solid #555',
            borderRadius: 4,
            color: '#fff',
            fontSize: 12,
          }}
        />
        <input
          type="text"
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={{
            width: '100%',
            padding: 6,
            marginBottom: 8,
            background: '#222',
            border: '1px solid #555',
            borderRadius: 4,
            color: '#fff',
            fontSize: 12,
          }}
        />
        <button
          onClick={addCloud}
          disabled={!newUrl || !newName || !viewer}
          style={{
            width: '100%',
            padding: '6px 12px',
            background: !newUrl || !newName ? '#555' : '#0066cc',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: !newUrl || !newName ? 'not-allowed' : 'pointer',
          }}
        >
          Add
        </button>
      </div>

      {clouds.map((cloud) => (
        <PointCloudControl key={cloud.name} url={cloud.url} name={cloud.name} />
      ))}
    </div>
  );
}

// ============================================
// Main Page
// ============================================

export default function WithHooksExample() {
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
            <ControlPanel />
          </PotreeViewer>
        </PotreeLoader>
      </PotreeProvider>
    </div>
  );
}
