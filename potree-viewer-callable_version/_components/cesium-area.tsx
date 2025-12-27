import { useEffect } from 'react';

import { usePotreeViewer } from '../store';
import proj4 from 'proj4';
import * as THREE from 'three';

import './cesium.css';

export default function CesiumArea() {
    const potreeViewer = usePotreeViewer((s) => s.viewer);
    const urlEnabled = usePotreeViewer((s) => (s.url || '')?.length > 0);
    const id = usePotreeViewer((s) => s.containerId);
    const zone = usePotreeViewer((s) => s.zone);

    const pointcloudProjection = `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs"`; // UTM Zone 47N
    console.log(
        'zone',
        zone,
        `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs"`
    );
    const mapProjection = '+proj=longlat +datum=WGS84 +no_defs';
    const toMap = proj4(pointcloudProjection, mapProjection);

    useEffect(() => {
        if (!potreeViewer || !urlEnabled) return;

        const cesiumViewer = new Cesium.Viewer(`cesium_container_${id}`, {
            useDefaultRenderLoop: false,
            animation: false,
            baseLayerPicker: false,
            fullscreenButton: false,
            geocoder: false,
            homeButton: false,
            infoBox: false,
            skyBox: false,
            sceneModePicker: false,
            selectionIndicator: false,
            timeline: false,
            navigationHelpButton: false,
            terrainShadows: Cesium.ShadowMode.DISABLED,
            imageryProvider: Cesium.createOpenStreetMapImageryProvider({
                url: 'https://a.tile.openstreetmap.org/',
            }),
            // terrain: Cesium.Terrain.fromWorldTerrain(),
        });

        const loop = (_timestamp: number) => {
            requestAnimationFrame(loop);

            if (cesiumViewer.isDestroyed()) {
                return;
            }

            const camera = potreeViewer.scene.getActiveCamera();

            const pPos = new THREE.Vector3(0, 0, 0).applyMatrix4(
                camera.matrixWorld
            );
            const pUp = new THREE.Vector3(0, 600, 0).applyMatrix4(
                camera.matrixWorld
            );
            const pTarget = potreeViewer.scene.view.getPivot();

            const toCes = (pos: THREE.Vector3) => {
                const xy = [pos.x, pos.y];
                const height = pos.z;
                const deg = toMap.forward(xy);
                const cPos = Cesium.Cartesian3.fromDegrees(
                    deg[0],
                    deg[1],
                    height - 30
                );

                return cPos;
            };

            const cPos = toCes(pPos);
            const cUpTarget = toCes(pUp);
            const cTarget = toCes(pTarget);

            let cDir = Cesium.Cartesian3.subtract(
                cTarget,
                cPos,
                new Cesium.Cartesian3()
            );
            let cUp = Cesium.Cartesian3.subtract(
                cUpTarget,
                cPos,
                new Cesium.Cartesian3()
            );

            cDir = Cesium.Cartesian3.normalize(cDir, new Cesium.Cartesian3());
            cUp = Cesium.Cartesian3.normalize(cUp, new Cesium.Cartesian3());

            cesiumViewer.camera.setView({
                destination: cPos,
                orientation: {
                    direction: cDir,
                    up: cUp,
                },
            });

            const aspect = potreeViewer.scene.getActiveCamera().aspect;
            if (aspect < 1) {
                const fovy =
                    Math.PI * (potreeViewer.scene.getActiveCamera().fov / 180);
                if (
                    cesiumViewer.camera.frustum instanceof
                    Cesium.PerspectiveFrustum
                ) {
                    cesiumViewer.camera.frustum.fov = fovy;
                }
            } else {
                const fovy =
                    Math.PI * (potreeViewer.scene.getActiveCamera().fov / 180);
                const fovx = Math.atan(Math.tan(0.5 * fovy) * aspect) * 2;
                if (
                    cesiumViewer.camera.frustum instanceof
                    Cesium.PerspectiveFrustum
                ) {
                    cesiumViewer.camera.frustum.fov = fovx;
                }
            }

            cesiumViewer.render();
        };

        requestAnimationFrame(loop);
        return () => {
            cesiumViewer.destroy();
        };
    }, [id, potreeViewer, toMap, urlEnabled]);

    return <></>;
}
