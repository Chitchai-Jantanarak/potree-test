/**
 * TypeScript declarations for Potree library
 * Potree is a WebGL point cloud viewer for large datasets
 */

declare global {
  interface Window {
    Potree: typeof Potree;
    jQuery: typeof jQuery;
    $: typeof jQuery;
    proj4: typeof proj4;
    TWEEN: unknown;
    THREE: unknown;
  }
}

declare namespace Potree {
  // ============================================
  // Core Viewer Class
  // ============================================
  class Viewer {
    constructor(domElement: HTMLElement, args?: ViewerArgs);

    // Scene and rendering
    scene: Scene;
    renderer: THREE.WebGLRenderer;
    clock: {
      getDelta: () => number;
      getElapsedTime: () => number;
    };

    // Controls
    earthControls: EarthControls;
    orbitControls: OrbitControls;
    fpControls: FirstPersonControls;
    deviceControls: DeviceOrientationControls;

    // Core methods
    update(delta: number, timestamp: number): void;
    render(): void;
    fitToScreen(duration?: number): void;

    // Settings
    setEDLEnabled(enabled: boolean): void;
    setEDLRadius(radius: number): void;
    setEDLStrength(strength: number): void;
    setFOV(fov: number): void;
    setPointBudget(budget: number): void;
    setBackground(background: 'skybox' | 'gradient' | 'black' | 'white' | null): void;
    setDescription(html: string): void;
    setControls(controls: EarthControls | OrbitControls | FirstPersonControls): void;

    // GUI and settings
    loadSettingsFromURL(): void;
    loadGUI(callback?: () => void): void;
    setLanguage(language: string): void;
    toggleSidebar(): void;

    // Navigation
    zoomTo(node: unknown, factor?: number, animationDuration?: number): void;
    setView(position: THREE.Vector3, target: THREE.Vector3, duration?: number): void;

    // Measurements
    measuringTool: MeasuringTool;
    profileTool: ProfileTool;
    volumeTool: VolumeTool;

    // Clipping
    clippingTool: ClippingTool;

    // Input handler
    inputHandler: InputHandler;

    // Event methods
    addEventListener(event: string, callback: (e: unknown) => void): void;
    removeEventListener(event: string, callback: (e: unknown) => void): void;
    dispatchEvent(event: { type: string; [key: string]: unknown }): void;
  }

  interface ViewerArgs {
    noDragAndDrop?: boolean;
    useDefaultRenderLoop?: boolean;
  }

  // ============================================
  // Scene
  // ============================================
  interface Scene {
    pointclouds: PointCloudOctree[];
    scene: THREE.Scene;
    scenePointCloud: THREE.Scene;
    cameraP: THREE.PerspectiveCamera;
    cameraO: THREE.OrthographicCamera;
    cameraMode: CameraMode;
    view: View;

    addPointCloud(pointcloud: PointCloudOctree): void;
    removePointCloud(pointcloud: PointCloudOctree): void;

    addMeasurement(measurement: Measure): void;
    removeMeasurement(measurement: Measure): void;

    addProfile(profile: Profile): void;
    removeProfile(profile: Profile): void;

    addVolume(volume: Volume): void;
    removeVolume(volume: Volume): void;

    addPolygonClipVolume(volume: PolygonClipVolume): void;
    removePolygonClipVolume(volume: PolygonClipVolume): void;

    getActiveCamera(): THREE.Camera;
  }

  interface View {
    position: THREE.Vector3;
    yaw: number;
    pitch: number;
    radius: number;
    maxPitch: number;
    minPitch: number;
    getPivot(): THREE.Vector3;
    lookAt(position: THREE.Vector3): void;
  }

  // ============================================
  // Point Cloud Types
  // ============================================
  interface PointCloudOctree {
    name: string;
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
    visible: boolean;
    material: PointCloudMaterial;
    boundingBox: THREE.Box3;
    boundingSphere: THREE.Sphere;
    pcoGeometry: PointCloudOctreeGeometry;
    projection: string | null;

    // Methods
    setPointSizeType(type: PointSizeType): void;
    setShape(shape: PointShape): void;
    setOpacity(opacity: number): void;
    setVisiblePointCount(count: number): void;
  }

  interface PointCloudMaterial {
    size: number;
    minSize: number;
    maxSize: number;
    pointSizeType: PointSizeType;
    shape: PointShape;
    opacity: number;
    activeAttributeName: string;
    color: THREE.Color;
    heightMin: number;
    heightMax: number;
    intensityRange: [number, number];
    intensityGamma: number;
    intensityContrast: number;
    intensityBrightness: number;
    rgbGamma: number;
    rgbContrast: number;
    rgbBrightness: number;
    weightRGB: number;
    weightIntensity: number;
    weightElevation: number;
    weightClassification: number;
    weightReturnNumber: number;
    weightSourceID: number;
    gradient: Gradient;
    matcap: THREE.Texture | null;
  }

  interface PointCloudOctreeGeometry {
    boundingBox: THREE.Box3;
    tightBoundingBox: THREE.Box3;
    offset: THREE.Vector3;
    projection: string | null;
    spacing: number;
  }

  // ============================================
  // Enums
  // ============================================
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

  enum PointColorType {
    RGB = 0,
    COLOR = 1,
    DEPTH = 2,
    HEIGHT = 3,
    ELEVATION = 3,
    INTENSITY = 4,
    INTENSITY_GRADIENT = 5,
    LOD = 6,
    LEVEL_OF_DETAIL = 6,
    POINT_INDEX = 7,
    CLASSIFICATION = 8,
    RETURN_NUMBER = 9,
    SOURCE = 10,
    NORMAL = 11,
    PHONG = 12,
    RGB_HEIGHT = 13,
    GPS_TIME = 14,
    COMPOSITE = 50,
  }

  enum TreeType {
    OCTREE = 0,
    KDTREE = 1,
  }

  enum CameraMode {
    PERSPECTIVE = 0,
    ORTHOGRAPHIC = 1,
  }

  enum ClipTask {
    NONE = 0,
    HIGHLIGHT = 1,
    SHOW_INSIDE = 2,
    SHOW_OUTSIDE = 3,
  }

  enum ClipMethod {
    INSIDE_ANY = 0,
    INSIDE_ALL = 1,
  }

  // ============================================
  // Gradients
  // ============================================
  const Gradients: {
    RAINBOW: Gradient;
    SPECTRAL: Gradient;
    YELLOW_GREEN: Gradient;
    VIRIDIS: Gradient;
    INFERNO: Gradient;
    GRAYSCALE: Gradient;
    TURBO: Gradient;
    PLASMA: Gradient;
  };

  type Gradient = Array<[number, THREE.Color]>;

  // ============================================
  // Controls
  // ============================================
  interface EarthControls {
    enabled: boolean;
    addEventListener(event: string, callback: () => void): void;
    removeEventListener(event: string, callback: () => void): void;
  }

  interface OrbitControls {
    enabled: boolean;
    addEventListener(event: string, callback: () => void): void;
    removeEventListener(event: string, callback: () => void): void;
  }

  interface FirstPersonControls {
    enabled: boolean;
    lockElevation: boolean;
    addEventListener(event: string, callback: () => void): void;
    removeEventListener(event: string, callback: () => void): void;
  }

  interface DeviceOrientationControls {
    enabled: boolean;
  }

  interface InputHandler {
    drag: unknown;
    mouse: THREE.Vector2;
    addInputListener(listener: unknown): void;
    removeInputListener(listener: unknown): void;
  }

  // ============================================
  // Tools
  // ============================================
  interface MeasuringTool {
    startInsertion(args?: { showDistances?: boolean; showArea?: boolean; closed?: boolean }): Measure;
  }

  interface ProfileTool {
    startInsertion(args?: { width?: number }): Profile;
  }

  interface VolumeTool {
    startInsertion(args?: { clip?: boolean }): Volume;
  }

  interface ClippingTool {
    volumes: Volume[];
    polygons: PolygonClipVolume[];
  }

  // ============================================
  // Measurement Objects
  // ============================================
  interface Measure {
    name: string;
    points: Array<{ position: THREE.Vector3 }>;
    showDistances: boolean;
    showCoordinates: boolean;
    showArea: boolean;
    closed: boolean;
    getArea(): number;
    getTotalDistance(): number;
  }

  interface Profile {
    name: string;
    points: Array<THREE.Vector3>;
    width: number;
  }

  interface Volume {
    name: string;
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
    clip: boolean;
    visible: boolean;
  }

  interface PolygonClipVolume {
    name: string;
    camera: THREE.Camera;
    markers: Array<{ position: THREE.Vector3 }>;
  }

  // ============================================
  // Loader Function
  // ============================================
  interface LoadPointCloudResult {
    pointcloud: PointCloudOctree;
    type: string;
    url: string;
  }

  function loadPointCloud(
    url: string,
    name: string,
    callback: (result: LoadPointCloudResult) => void
  ): void;

  // ============================================
  // Utility Functions
  // ============================================
  function loadProject(url: string): Promise<unknown>;

  function saveProject(viewer: Viewer): string;

  // ============================================
  // Version
  // ============================================
  const version: {
    major: number;
    minor: number;
    suffix: string;
  };
}

export { Potree };
export default Potree;
