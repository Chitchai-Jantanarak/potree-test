type Background = 'skybox' | null;

declare namespace Potree {
    class Viewer {
        constructor(
            domElement: HTMLElement,
            args? = { useDefaultRenderLoop: boolean }
        );

        earthControls: unknown;
        orbitControls: {
            doubleClockZoomEnabled: boolean;
        };
        useHQ: boolean;

        scene: InstanceType<(typeof import('three'))['Scene']> & {
            scene: InstanceType<(typeof import('three'))['Scene']>;
            scenePointCloud: {
                remove: (pointcloud: unknown) => void;
            };
            pointclouds: {
                pcoGeometry: { url: string };
            }[];

            addPointCloud: (pointcloud: unknown) => void;
            add360Images: (images: unknown) => void;
            getActiveCamera: () => InstanceType<
                (typeof import('three'))['Object3D']
            > & {
                aspect: number;
                fov: number;
            };
            view: {
                getPivot: () => InstanceType<
                    (typeof import('three'))['Vector3']
                >;
                position: InstanceType<(typeof import('three'))['Vector3']>;
                setView: (
                    position: InstanceType<(typeof import('three'))['Vector3']>,
                    target: InstanceType<(typeof import('three'))['Vector3']>,
                    duration: number
                ) => void;
            };
        };
        classifications: {
            [id: string]: { visible: boolean; name: string; color: number[] };
        };

        renderer: {
            domElement: HTMLElement;
        };

        setEDLEnabled(enabled: boolean);
        setFOV(fov: number);
        setPointBudget(pointBudget: number);
        setMinNodeSize(minNodeSize: number);
        setBackground(background: Background);
        setControls(controls: Potree.Viewer.earthControls): void;
        setLanguage(language: 'en');
        loadGUI(callback: () => void, selector: string): void;
        loadSettingsFromURL(): void;
        setDescription(description: string);
        toggleSidebar(): void;

        fitToScreen();
        render();
    }

    class Images360Loader {
        static load(
            url: string,
            viewer: Potree.Viewer,
            params: unknown
        ): Promise<unknown>;
    }

    export function loadPointCloud(
        url: string,
        name: string,
        callback: (e: {
            pointcloud: {
                material: {
                    size: number;
                    pointSizeType: PointSizeType;
                    shape: PointShape;
                    activeAttributeName: string; // rgba, elevation
                };
                name: string;
                visible: boolean;
                updateMatrixWorld: () => void;
            };
        }) => void
    );

    export enum PointSizeType {
        ADAPTIVE,
    }

    export enum PointShape {
        SQUARE,
    }
}
