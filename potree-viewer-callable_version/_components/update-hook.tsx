import { useEffect } from 'react';

import { usePotreeViewer } from '../store';

interface UpdateHookProps {
    noAutoFocus?: boolean;
}

export default function UpdateHook(props: UpdateHookProps) {
    const { noAutoFocus } = props;

    const url = usePotreeViewer((s) => s.url);
    const viewer = usePotreeViewer((s) => s.viewer);
    const potreeLoading = usePotreeViewer((s) => s.potreeLoading);

    useEffect(() => {
        if (typeof Potree !== 'undefined' && viewer && url) {
            Potree.loadPointCloud(url, 'สถาบันสารสนเทศทรัพยากรน้ำ', (e) => {
                const scene = viewer.scene;
                const pointcloud = e.pointcloud;

                const material = pointcloud.material;
                material.size = 0.6;
                material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
                material.shape = Potree.PointShape.SQUARE;
                material.activeAttributeName = 'rgba';

                scene.addPointCloud(pointcloud);
                if (!noAutoFocus) viewer.fitToScreen();
            });
        }
    }, [noAutoFocus, potreeLoading, url, viewer]);

    return <></>;
}
