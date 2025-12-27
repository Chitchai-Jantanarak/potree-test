declare namespace Cesium {
    class Viewer {
        constructor(elementId: string, args? = {});

        camera: InstanceType<(typeof import('three'))['Camera']> & {
            setView: (args: {
                destination: Cartesian3;
                orientation: { direction: Cartesian3; up: Cartesian3 };
            }) => void;
            frustum: PerspectiveFrustum;
        };

        render();
        destroy();
        isDestroyed(): boolean;
    }

    export function createOpenStreetMapImageryProvider(args: { url: string });
    export enum ShadowMode {
        DISABLED,
    }

    class Cartesian3 {
        constructor();

        static fromDegrees(
            lon: number,
            lat: number,
            height: number
        ): Cartesian3;
        static subtract(
            a: Cartesian3,
            b: Cartesian3,
            result: Cartesian3
        ): Cartesian3;

        static normalize(cartesian: Cartesian3, result: Cartesian3): Cartesian3;
    }

    class PerspectiveFrustum {
        constructor();

        fov: number;
    }
}
