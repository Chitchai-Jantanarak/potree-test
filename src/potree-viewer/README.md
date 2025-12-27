# Potree Viewer

A React component for visualizing point clouds with Potree and Cesium integration, designed for flood simulation and geospatial applications.

## Installation

The potree-viewer is included in the project. Ensure the `public/potree-static` folder contains the Potree and Cesium libraries.

## Quick Start

```tsx
import { PotreeViewer } from "@/potree-viewer";

export default function MapPage() {
  const handleReady = (viewer: Potree.Viewer) => {
    // Load point cloud externally
    window.Potree.loadPointCloud(
      "https://example.com/pointcloud/ept.json",
      "MyPointCloud",
      (result) => {
        const pointcloud = result.pointcloud;
        pointcloud.material.size = 0.6;
        pointcloud.material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
        pointcloud.material.activeAttributeName = "elevation";
        
        viewer.scene.addPointCloud(pointcloud);
        viewer.fitToScreen();
      }
    );
  };

  return (
    <div className="h-screen w-screen">
      <PotreeViewer
        cesium={{ enabled: true, zone: "47" }}
        sidebar
        onReady={handleReady}
      />
    </div>
  );
}
```

## Point Cloud + Cesium Alignment Guide

When using Potree with Cesium, proper coordinate alignment is critical. The point cloud and Cesium globe must use the same coordinate reference system.

### Understanding UTM Zones

Point cloud data is typically stored in UTM (Universal Transverse Mercator) coordinates. You must configure the correct UTM zone for your data:

| Zone | Region | Longitude Range |
|------|--------|-----------------|
| `10` | US West Coast (California, Oregon, Washington) | -126° to -120° |
| `47` | Thailand West | 96° to 102° |
| `48` | Thailand East | 102° to 108° |

### Configuring the Zone

```tsx
// San Francisco data (UTM Zone 10)
<PotreeViewer
  cesium={{ zone: "10", mapProvider: "esri" }}
  onReady={handleReady}
/>

// Thailand data (UTM Zone 47)
<PotreeViewer
  cesium={{ zone: "47", mapProvider: "osm" }}
  onReady={handleReady}
/>
```

### Adjusting Elevation Offset

Point cloud Z values may not match Cesium's ellipsoid height. Use `offsetZ` to adjust:

```tsx
<PotreeViewer
  cesium={{ 
    zone: "47", 
    offsetZ: -30,  // Negative: lower the point cloud
                   // Positive: raise the point cloud
    mapProvider: "esri" 
  }}
  onReady={handleReady}
/>
```

**How to find the correct offset:**
1. Load your point cloud
2. Click "Log Position" to see current camera coordinates
3. Compare Z value with expected ground elevation
4. Adjust `offsetZ` until the point cloud sits correctly on terrain

### Point Cloud Material Settings

Configure how points are rendered:

```tsx
const handleReady = (viewer: Potree.Viewer) => {
  window.Potree.loadPointCloud(url, name, (result) => {
    const material = result.pointcloud.material;
    
    // Point size
    material.size = 0.6;  // Adjust for density
    
    // Size type
    material.pointSizeType = Potree.PointSizeType.ADAPTIVE;  // Auto-adjust
    // or: Potree.PointSizeType.FIXED
    // or: Potree.PointSizeType.ATTENUATED
    
    // Point shape
    material.shape = Potree.PointShape.SQUARE;  // Fastest
    // or: Potree.PointShape.CIRCLE
    // or: Potree.PointShape.PARABOLOID
    
    // Coloring attribute
    material.activeAttributeName = "elevation";  // Color by height
    // or: "rgba"          - Original colors (if available)
    // or: "intensity"     - LiDAR intensity
    // or: "classification" - Point classification
    
    viewer.scene.addPointCloud(result.pointcloud);
    viewer.fitToScreen();
  });
};
```

## Usage Examples

### Basic Viewer (Potree Only, No Cesium)

```tsx
<PotreeViewer
  config={{
    fov: 60,
    pointBudget: 1_000_000,
    controls: "orbit",
  }}
  onReady={(viewer) => {
    // Load point cloud without Cesium globe
  }}
/>
```

### With Cesium Globe

```tsx
<PotreeViewer
  cesium={{
    enabled: true,
    zone: "47",
    mapProvider: "esri",
    offsetZ: 0,
  }}
  sidebar
  onReady={handleReady}
/>
```

### Using Variants

```tsx
import { PotreeViewer, type PotreeViewerVariant } from "@/potree-viewer";

// Preset variants
<PotreeViewer variant="flood-simulation" onReady={handleReady} />
<PotreeViewer variant="terrain-analysis" onReady={handleReady} />
<PotreeViewer variant="minimal" onReady={handleReady} />

// Variant with overrides
<PotreeViewer
  variant="flood-simulation"
  cesium={{ zone: "10", mapProvider: "esri" }}
  onReady={handleReady}
/>
```

### Accessing Viewer from Child Components

```tsx
import { usePotreeStore } from "@/potree-viewer";

function ChildComponent() {
  const viewer = usePotreeStore((s) => s.viewer);
  const cesiumViewer = usePotreeStore((s) => s.cesiumViewer);

  const flyTo = (lon: number, lat: number, height: number) => {
    if (cesiumViewer && window.Cesium) {
      cesiumViewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
        duration: 2,
      });
    }
  };

  return (
    <button onClick={() => flyTo(100.5, 13.75, 50000)}>
      Fly to Thailand
    </button>
  );
}

// Use inside PotreeViewer
<PotreeViewer cesium={{ zone: "47" }} onReady={handleReady}>
  <ChildComponent />
</PotreeViewer>
```

## Props

### PotreeViewerProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `PotreeViewerVariant` | - | Preset configuration variant |
| `containerId` | `string` | `"potree_render_area"` | Container element ID |
| `config` | `Partial<PotreeViewerConfig>` | - | Viewer configuration |
| `cesium` | `Partial<CesiumConfig>` | - | Cesium configuration |
| `sidebar` | `boolean` | `false` | Show Potree sidebar GUI |
| `className` | `string` | - | Additional CSS classes |
| `onReady` | `(viewer, cesium?) => void` | - | Callback when ready - load point clouds here |
| `onError` | `(error) => void` | - | Error callback |

### PotreeViewerConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `fov` | `number` | `60` | Field of view |
| `pointBudget` | `number` | `1_000_000` | Maximum points to render |
| `edlEnabled` | `boolean` | `true` | Eye-Dome Lighting |
| `edlRadius` | `number` | `1.4` | EDL radius |
| `edlStrength` | `number` | `0.4` | EDL strength |
| `background` | `BackgroundType` | `null` | Background type |
| `controls` | `ControlType` | `"orbit"` | Control type |
| `showSidebar` | `boolean` | `true` | Show sidebar |

### CesiumConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable Cesium globe |
| `zone` | `"10" \| "47" \| "48"` | `"47"` | UTM zone for coordinate transformation |
| `offsetZ` | `number` | `0` | Elevation offset (meters) |
| `mapProvider` | `MapProvider` | `"osm"` | Map tile provider |

## Variants

| Variant | Description |
|---------|-------------|
| `flood-simulation` | Optimized for flood analysis with Cesium, sidebar, orbit controls |
| `terrain-analysis` | High-quality rendering with enhanced EDL |
| `minimal` | Basic viewer without Cesium or sidebar |
| `presentation` | High point budget with dark theme |

## Mouse Controls

| Action | Control |
|--------|---------|
| Rotate | Left-drag |
| Pan | Right-drag |
| Zoom | Scroll wheel |
| Zoom to point | Double-click |

## Map Providers

| Provider | Description |
|----------|-------------|
| `osm` | OpenStreetMap |
| `esri` | ESRI Satellite Imagery |
| `carto-voyager` | Carto Voyager |
| `carto-voyager-nolabels` | Carto Voyager (no labels) |
| `carto-positron` | Carto Positron (light) |
| `carto-positron-nolabels` | Carto Positron (no labels) |
| `carto-dark` | Carto Dark |
| `carto-dark-nolabels` | Carto Dark (no labels) |

## Project Structure

```
src/potree-viewer/
├── index.ts              # Public exports
├── PotreeViewer.tsx      # Main component
├── store.tsx             # Zustand store with provider
├── constants.ts          # Configuration constants
├── styles.css            # Essential CSS
├── variants.ts           # Preset configurations
├── types/
│   ├── index.ts          # Public types
│   └── globals.d.ts      # Global window types
├── hooks/
│   ├── index.ts          # Hook exports
│   └── usePotreeViewer.ts
└── _internal/
    ├── ScriptLoader.tsx
    ├── ViewerContainer.tsx
    ├── ViewerInitializer.tsx
    └── CesiumLayer.tsx
```

## Troubleshooting

### Point cloud not visible
- Check browser console for errors
- Verify point cloud URL is accessible (CORS enabled)
- Ensure `onReady` callback loads the point cloud

### Point cloud floating above/below terrain
- Adjust `offsetZ` in cesium config
- Verify correct UTM zone is set

### Cesium not showing
- Check that `cesium.enabled` is not `false`
- Verify Cesium libraries are in `public/potree-static/lib/Cesium/`

### Sidebar not appearing
- Set `sidebar={true}` prop
- Check that potree.css is loaded