/**
 * Global type declarations for Potree, Cesium, THREE, and TWEEN
 */

interface Window {
  Potree: typeof Potree;
  Cesium: typeof Cesium;
  THREE: typeof THREE;
  TWEEN: typeof TWEEN;
  $: JQueryStatic;
  jQuery: JQueryStatic;
}

// Minimal jQuery types
interface JQueryStatic {
  (selector: string): JQuery;
}
interface JQuery {
  show(): JQuery;
  hide(): JQuery;
  next(): JQuery;
}

// THREE.js (minimal)
declare namespace THREE {
  class Vector2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
  }
  class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    copy(v: Vector3): this;
    applyMatrix4(m: Matrix4): this;
  }
  class Matrix4 {}
  class Euler {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
  }
  class Box3 {
    min: Vector3;
    max: Vector3;
  }
  class Sphere {
    center: Vector3;
    radius: number;
  }
  class Color {
    r: number;
    g: number;
    b: number;
    constructor(r?: number | string, g?: number, b?: number);
  }
  class Scene {
    add(obj: Object3D): void;
    remove(obj: Object3D): void;
  }
  class Object3D {
    position: Vector3;
    rotation: Euler;
    scale: Vector3;
    visible: boolean;
    matrixWorld: Matrix4;
    updateMatrixWorld(): void;
  }
  class Camera extends Object3D {
    aspect: number;
    fov: number;
  }
  class PerspectiveCamera extends Camera {}
  class OrthographicCamera extends Camera {}
  class Texture {}
  class WebGLRenderer {
    domElement: HTMLCanvasElement;
  }
}

// TWEEN (minimal)
declare namespace TWEEN {
  function update(time?: number): boolean;
}

// Potree
declare namespace Potree {
  // Enums
  enum PointSizeType {
    FIXED = 0,
    ATTENUATED = 1,
    ADAPTIVE = 2,
  }

  enum PointShape {
    SQUARE = 0,
    CIRCLE = 1,
    PARABOLOID = 2,
  }

  class Viewer {
    constructor(element: HTMLElement, args?: { useDefaultRenderLoop?: boolean });

    scene: Scene & {
      scene: THREE.Scene;
      scenePointCloud: { remove: (pc: unknown) => void };
      getActiveCamera: () => THREE.Camera;
      view: {
        position: THREE.Vector3;
        getPivot: () => THREE.Vector3;
        setView: (pos: THREE.Vector3, target: THREE.Vector3, duration: number) => void;
      };
    };
    renderer: THREE.WebGLRenderer;
    classifications: Record<string, { visible: boolean; name: string; color: number[] }>;

    setEDLEnabled(enabled: boolean): void;
    setEDLRadius(radius: number): void;
    setEDLStrength(strength: number): void;
    setFOV(fov: number): void;
    setPointBudget(budget: number): void;
    setMinNodeSize(size: number): void;
    setBackground(bg: 'skybox' | 'gradient' | 'black' | 'white' | null): void;
    setControls(controls: unknown): void;
    setLanguage(lang: string): void;
    setDescription(desc: string): void;

    loadSettingsFromURL(): void;
    loadGUI(callback?: () => void, selector?: string): void;
    toggleSidebar(): void;
    fitToScreen(duration?: number): void;
    render(): void;

    earthControls: unknown;
    orbitControls: { doubleClockZoomEnabled: boolean };
    fpControls: unknown;
    useHQ: boolean;
  }

  interface Scene {
    pointclouds: PointCloudOctree[];
    addPointCloud(pc: PointCloudOctree): void;
    removePointCloud(pc: PointCloudOctree): void;
    add360Images(images: unknown): void;
  }

  interface PointCloudOctree {
    name: string;
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
    visible: boolean;
    material: PointCloudMaterial;
    boundingBox: THREE.Box3;
    pcoGeometry: { url: string };
    updateMatrixWorld(): void;
  }

  interface PointCloudMaterial {
    size: number;
    pointSizeType: PointSizeType | number;
    shape: PointShape | number;
    opacity: number;
    activeAttributeName: string;
  }

  interface LoadResult {
    pointcloud: PointCloudOctree;
  }

  function loadPointCloud(
    url: string,
    name: string,
    callback: (e: LoadResult) => void
  ): void;

  class Images360Loader {
    static load(url: string, viewer: Viewer, params: unknown): Promise<unknown>;
  }
}

// Cesium
declare namespace Cesium {
  const Ion: {
    defaultAccessToken: string;
  };

  enum ShadowMode {
    DISABLED = 0,
    ENABLED = 1,
    CAST_ONLY = 2,
    RECEIVE_ONLY = 3,
  }

  class Viewer {
    constructor(container: string | HTMLElement, options?: ViewerOptions);
    scene: Scene;
    camera: Camera;
    canvas: HTMLCanvasElement;
    render(): void;
    destroy(): void;
    isDestroyed(): boolean;
  }

  interface ViewerOptions {
    useDefaultRenderLoop?: boolean;
    animation?: boolean;
    baseLayerPicker?: boolean;
    fullscreenButton?: boolean;
    vrButton?: boolean;
    geocoder?: boolean;
    homeButton?: boolean;
    infoBox?: boolean;
    sceneModePicker?: boolean;
    selectionIndicator?: boolean;
    timeline?: boolean;
    navigationHelpButton?: boolean;
    scene3DOnly?: boolean;
    skyBox?: boolean;
    terrainShadows?: ShadowMode;
    imageryProvider?: ImageryProvider;
    creditContainer?: HTMLElement;
  }

  class Scene {
    globe: Globe;
    primitives: PrimitiveCollection;
    preRender: Event;
  }

  class Event {
    addEventListener(callback: () => void): () => void;
    removeEventListener(callback: () => void): void;
  }

  class Globe {
    show: boolean;
    depthTestAgainstTerrain: boolean;
  }

  class Camera {
    position: Cartesian3;
    positionWC: Cartesian3;
    positionCartographic: Cartographic;
    frustum: PerspectiveFrustum | OrthographicFrustum;
    setView(options: {
      destination: Cartesian3;
      orientation?: { direction: Cartesian3; up: Cartesian3 };
    }): void;
    flyTo(options: { destination: Cartesian3; duration?: number }): void;
    zoomIn(amount?: number): void;
    zoomOut(amount?: number): void;
  }

  class PerspectiveFrustum {
    fov: number;
  }

  class OrthographicFrustum {}

  class Cartesian3 {
    x: number;
    y: number;
    z: number;
    constructor();
    static fromDegrees(lon: number, lat: number, height?: number): Cartesian3;
    static subtract(a: Cartesian3, b: Cartesian3, result: Cartesian3): Cartesian3;
    static normalize(cartesian: Cartesian3, result: Cartesian3): Cartesian3;
  }

  class Cartographic {
    longitude: number;
    latitude: number;
    height: number;
  }

  class PrimitiveCollection {
    add(p: unknown): void;
    remove(p: unknown): boolean;
  }

  class ImageryProvider {}

  class UrlTemplateImageryProvider extends ImageryProvider {
    constructor(options: { url: string; maximumLevel?: number });
  }

  class ArcGisMapServerImageryProvider extends ImageryProvider {
    constructor(options: { url: string });
  }

  function createOpenStreetMapImageryProvider(options?: {
    url?: string;
  }): ImageryProvider;

  const buildModuleUrl: {
    setBaseUrl(url: string): void;
  };
}
