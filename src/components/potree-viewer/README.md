# Potree Viewer

provider for calling potree module script set on public/potree-static

## Quick Start

```tsx
import { PotreeViewer, usePointCloudLoader, type PointCloudSource } from "@/potree-viewer";

const POINT_CLOUDS: PointCloudSource[] = [
  { id: "sf", name: "San Francisco", url: "https://example.com/sf/ept.json" },
  { id: "ny", name: "New York", url: "https://example.com/ny/ept.json" },
];

function PointCloudControls({ sources }: { sources: PointCloudSource[] }) {
  const { loadPointClouds, flyTo, fitAll } = usePointCloudLoader();

  useEffect(() => {
    loadPointClouds(sources).then(() => flyTo(sources[0].id));
  }, []);

  return (
    <div>
      {sources.map((s) => (
        <button key={s.id} onClick={() => flyTo(s.id)}>{s.name}</button>
      ))}
      <button onClick={fitAll}>Fit All</button>
    </div>
  );
}

export default function MapPage() {
  const [ready, setReady] = useState(false);

  return (
    <PotreeViewer
      cesium={{ projection: "mercator", mapProvider: "esri" }}
      sidebar
      onReady={() => setReady(true)}
    >
      {ready && <PointCloudControls sources={POINT_CLOUDS} />}
    </PotreeViewer>
  );
}
```

## usePointCloudLoader Hook

Manages loading and navigation for multiple point clouds.

```tsx
const {
  pointClouds,      // Map<string, LoadedPointCloud>
  loadingStates,    // Record<string, boolean>
  loadPointCloud,   // (source, options?) => Promise<LoadedPointCloud | null>
  loadPointClouds,  // (sources, options?) => Promise<void>
  flyTo,            // (id, factor?, duration?) => void
  fitAll,           // () => void
  getPointCloud,    // (id) => LoadedPointCloud | undefined
} = usePointCloudLoader();
```

### PointCloudSource

```tsx
interface PointCloudSource {
  id: string;
  name: string;
  url: string;
}
```

### PointCloudMaterialOptions

```tsx
interface PointCloudMaterialOptions {
  size?: number;                    // default: 0.6
  pointSizeType?: "fixed" | "adaptive" | "attenuated";
  shape?: "square" | "circle" | "paraboloid";
  activeAttributeName?: string;     // "elevation", "rgba", "intensity", "classification"
}
```

### LoadedPointCloud

```tsx
interface LoadedPointCloud {
  id: string;
  name: string;
  pointcloud: Potree.PointCloudOctree;
  center: { x: number; y: number; z: number };
  size: number;
}
```

## PotreeViewer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `PotreeViewerVariant` | - | Preset configuration |
| `config` | `Partial<PotreeViewerConfig>` | - | Viewer settings |
| `cesium` | `Partial<CesiumConfig>` | - | Cesium settings |
| `sidebar` | `boolean` | `false` | Show Potree sidebar |
| `onReady` | `(viewer, cesium?) => void` | - | Ready callback |
| `onError` | `(error) => void` | - | Error callback |

## CesiumConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable Cesium globe |
| `projection` | `Projection` | `"mercator"` | Coordinate projection |
| `offsetZ` | `number` | `0` | Elevation offset (meters) |
| `mapProvider` | `MapProvider` | `"osm"` | Map tile provider |

### Projections

| Projection | Description |
|------------|-------------|
| `mercator` | Web Mercator (EPSG:3857) - most online point clouds |
| `utm10` | UTM Zone 10 - US West Coast |
| `utm47` | UTM Zone 47 - Thailand West |
| `utm48` | UTM Zone 48 - Thailand East |

### Map Providers

| Provider | Description |
|----------|-------------|
| `osm` | OpenStreetMap |
| `esri` | ESRI Satellite Imagery |
| `carto-voyager` | Carto Voyager |
| `carto-positron` | Carto Positron (light) |
| `carto-dark` | Carto Dark |

## PotreeViewerConfig

| Option | Type | Default |
|--------|------|---------|
| `fov` | `number` | `60` |
| `pointBudget` | `number` | `1_000_000` |
| `edlEnabled` | `boolean` | `true` |
| `edlRadius` | `number` | `1.4` |
| `edlStrength` | `number` | `0.4` |
| `background` | `BackgroundType` | `null` |
| `controls` | `ControlType` | `"orbit"` |

## Project Structure

```
src/potree-viewer/
├── index.ts
├── PotreeViewer.tsx
├── store.tsx
├── constants.ts
├── variants.ts
├── styles.css
├── types/
│   ├── index.ts
│   └── globals.d.ts
├── hooks/
│   ├── index.ts
│   ├── usePotreeViewer.ts
│   └── usePointCloudLoader.ts
└── _internal/
    ├── ScriptLoader.tsx
    ├── ViewerContainer.tsx
    ├── ViewerInitializer.tsx
    └── CesiumLayer.tsx
```
