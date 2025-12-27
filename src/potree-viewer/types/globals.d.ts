interface Window {
  Potree: typeof Potree;
  Cesium: typeof Cesium;
  THREE: typeof THREE;
  TWEEN: typeof TWEEN;
  $: JQueryStatic;
  jQuery: JQueryStatic;
  proj4: Proj4Static;
}

interface JQueryStatic {
  (selector: string): JQuery;
}

interface JQuery {
  show(): JQuery;
  hide(): JQuery;
  toggle(): JQuery;
}

interface Proj4Static {
  (fromProj: string, toProj: string): Proj4Converter;
}

interface Proj4Converter {
  forward(coord: [number, number]): [number, number];
  inverse(coord: [number, number]): [number, number];
}

declare namespace THREE {
  class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    applyMatrix4(m: Matrix4): this;
  }
  class Matrix4 {
    elements: number[];
  }
  class Euler {
    x: number;
    y: number;
    z: number;
  }
  class Box3 {
    min: Vector3;
    max: Vector3;
  }
  class Camera {
    aspect: number;
    fov: number;
    matrixWorld: Matrix4;
  }
  class WebGLRenderer {
    domElement: HTMLCanvasElement;
  }
}

declare namespace TWEEN {
  function update(time?: number): boolean;

  class Tween<T> {
    constructor(object: T);
    to(target: Partial<T>, duration: number): this;
    easing(fn: (k: number) => number): this;
    onUpdate(callback: () => void): this;
    onComplete(callback: () => void): this;
    start(): this;
    stop(): this;
  }

  const Easing: {
    Linear: { None: (k: number) => number };
    Quadratic: {
      In: (k: number) => number;
      Out: (k: number) => number;
      InOut: (k: number) => number;
    };
    Cubic: {
      In: (k: number) => number;
      Out: (k: number) => number;
      InOut: (k: number) => number;
    };
    Exponential: {
      In: (k: number) => number;
      Out: (k: number) => number;
      InOut: (k: number) => number;
    };
  };
}

declare namespace Potree {
  let scriptPath: string;
  let resourcePath: string;

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

  interface View {
    position: THREE.Vector3;
    yaw: number;
    pitch: number;
    radius: number;
    getPivot: () => THREE.Vector3;
  }

  class Viewer {
    constructor(element: HTMLElement);
    scene: Scene & {
      getActiveCamera: () => THREE.Camera;
      view: View;
    };
    renderer: THREE.WebGLRenderer;
    classifications: Record<
      string,
      { visible: boolean; name: string; color: number[] }
    >;
    orbitControls: unknown;
    setEDLEnabled(enabled: boolean): void;
    setEDLRadius(radius: number): void;
    setEDLStrength(strength: number): void;
    setFOV(fov: number): void;
    setPointBudget(budget: number): void;
    setBackground(bg: "skybox" | "gradient" | "black" | "white" | null): void;
    setControls(controls: unknown): void;
    setDescription(desc: string): void;
    loadSettingsFromURL(): void;
    loadGUI(callback?: () => void): void;
    fitToScreen(): void;
    zoomTo(
      node: PointCloudOctree | { boundingBox: THREE.Box3 },
      factor?: number,
      animationDuration?: number,
    ): void;
  }

  interface Scene {
    pointclouds: PointCloudOctree[];
    addPointCloud(pc: PointCloudOctree): void;
  }

  interface PointCloudOctree {
    name: string;
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
    visible: boolean;
    material: PointCloudMaterial;
    boundingBox: THREE.Box3;
  }

  interface PointCloudMaterial {
    size: number;
    pointSizeType: PointSizeType | number;
    shape: PointShape | number;
    activeAttributeName: string;
  }

  interface LoadResult {
    pointcloud: PointCloudOctree;
  }

  function loadPointCloud(
    url: string,
    name: string,
    callback: (e: LoadResult) => void,
  ): void;
}

declare namespace Cesium {
  enum ShadowMode {
    DISABLED = 0,
  }

  class Viewer {
    constructor(container: HTMLElement | string, options?: ViewerOptions);
    camera: Camera;
    render(): void;
    destroy(): void;
    isDestroyed(): boolean;
  }

  interface ViewerOptions {
    useDefaultRenderLoop?: boolean;
    animation?: boolean;
    baseLayerPicker?: boolean;
    fullscreenButton?: boolean;
    geocoder?: boolean;
    homeButton?: boolean;
    infoBox?: boolean;
    skyBox?: boolean;
    sceneModePicker?: boolean;
    selectionIndicator?: boolean;
    timeline?: boolean;
    navigationHelpButton?: boolean;
    terrainShadows?: ShadowMode;
    imageryProvider?: ImageryProvider;
    creditContainer?: HTMLElement | string;
  }

  class Camera {
    frustum: PerspectiveFrustum;
    setView(options: {
      destination: Cartesian3;
      orientation?: { direction: Cartesian3; up: Cartesian3 };
    }): void;
    flyTo(options: { destination: Cartesian3; duration?: number }): void;
  }

  class PerspectiveFrustum {
    fov: number;
  }

  class Cartesian3 {
    x: number;
    y: number;
    z: number;
    constructor();
    static fromDegrees(lon: number, lat: number, height?: number): Cartesian3;
    static subtract(
      a: Cartesian3,
      b: Cartesian3,
      result: Cartesian3,
    ): Cartesian3;
    static normalize(cartesian: Cartesian3, result: Cartesian3): Cartesian3;
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
