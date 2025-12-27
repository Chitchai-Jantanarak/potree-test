import { useContext, useEffect } from 'react';

import { PotreeViewerContext, usePotreeViewer } from '../store';

export default function InitialHook() {
    const store = useContext(PotreeViewerContext);

    const id = usePotreeViewer((s) => s.containerId);
    const sidebar = usePotreeViewer((s) => s.sidebar);
    const potreeLoading = usePotreeViewer((s) => s.potreeLoading);
    const setViewer = usePotreeViewer((s) => s.setViewer);
    const pointBudget = usePotreeViewer((s) => s.pointBudget);

    useEffect(() => {
        const loadPotree = () => {
            if (!potreeLoading) return;
            const area = document.getElementById(id);

            if (
                typeof Potree !== 'undefined' &&
                area &&
                store?.getState().viewer === null
            ) {
                const viewer = new Potree.Viewer(area);
                viewer.classifications = {
                    // '1': {
                    //     visible: true,
                    //     name: 'Unclassified',
                    //     color: [0.6, 0.6, 0.6, 1],
                    // },
                    '2': {
                        visible: true,
                        name: 'Ground',
                        color: [0.55, 0.27, 0.07, 1],
                    },
                    '3': {
                        visible: true,
                        name: 'Natural',
                        color: [0.13, 0.55, 0.13, 1],
                    },
                    '6': {
                        visible: true,
                        name: 'Building',
                        color: [0.3, 0.5, 0.7, 1],
                    },
                    // '14': {
                    //     visible: true,
                    //     name: 'Utility line',
                    //     color: [1, 0.85, 0, 1],
                    // },
                    // '15': {
                    //     visible: true,
                    //     name: 'Pole',
                    //     color: [1, 0.55, 0.1, 1],
                    // },
                    // '64': {
                    //     visible: true,
                    //     name: 'Road markings',
                    //     color: [1, 1, 1, 1],
                    // },
                    // '65': {
                    //     visible: true,
                    //     name: 'Car',
                    //     color: [1, 0, 0, 1],
                    // },
                    // '66': {
                    //     visible: true,
                    //     name: 'Fence',
                    //     color: [0.6, 0.2, 0.7, 1],
                    // },
                };

                setViewer(viewer);

                // viewer.useHQ = true;
                viewer.setEDLEnabled(true);
                viewer.setFOV(60);
                viewer.setBackground(null);
                viewer.setPointBudget(pointBudget);
                viewer.loadSettingsFromURL();
                viewer.setControls(viewer.orbitControls);

                viewer.toggleSidebar = () => {
                    const renderArea = document.getElementById(id);
                    if (!renderArea) return;
                    const isVisible = renderArea.style.left !== '0px';

                    if (isVisible) {
                        renderArea.style.left = '0px';
                    } else {
                        renderArea.style.left = '300px';
                    }
                };

                viewer.setDescription('');

                if (sidebar) {
                    viewer.loadGUI(() => {}, `#potree_sidebar_container_${id}`);
                }

                // Potree.Images360Loader.load(
                //     "http://5.9.65.151/mschuetz/potree/resources/pointclouds/helimap/360/Drive2_selection",
                //     viewer,
                //     {}
                // ).then((images) => {
                //     viewer.scene.add360Images(images);
                // });

                return viewer;
            }
        };

        loadPotree();

        // return () => {
        //     const viewer = store?.getState().viewer;
        //     if (viewer) {
        //         // viewer.dispose();

        //         const area = document.getElementById(id);
        //         if (area) {
        //             area.innerHTML = '';
        //         }

        //         setViewer(null);
        //     }
        // };
    }, [id, pointBudget, potreeLoading, setViewer, sidebar, store]);
    // }, [id, pointBudget, potreeLoading, setViewer, sidebar, store, url]);

    return <></>;
}
