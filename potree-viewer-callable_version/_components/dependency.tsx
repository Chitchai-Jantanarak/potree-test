'use client';

import { useEffect } from 'react';

import { usePotreeViewer } from '../store';

import '@/../public/potree-build/jquery-ui/jquery-ui.min.css';
import '@/../public/potree-build/jstree/themes/mixed/style.css';
import '@/../public/potree-build/openlayers3/ol.css';
import '@/../public/potree-build/potree/potree.css';
import '@/../public/potree-build/spectrum/spectrum.css';

interface DependencyProps {
    children?: React.ReactNode;
}

export default function Dependency(props: DependencyProps) {
    const { children } = props;
    const togglePotreeLoading = usePotreeViewer((s) => s.togglePotreeLoading);

    useEffect(() => {
        const loadScript = (src: string) => {
            return new Promise((resolve, reject) => {
                // if (document.querySelector(`script[src="${src}"]`)) {
                //     resolve(undefined);
                //     return;
                // }

                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.onload = resolve;
                script.onerror = () =>
                    reject(new Error(`Failed to load script: ${src}`));
                document.body.appendChild(script);
            });
        };

        loadScript('/potree-build/jquery/jquery-3.1.1.min.js')
            .then(() => loadScript('/potree-build/proj4/proj4.js'))
            .then(() => loadScript('/potree-build/spectrum/spectrum.js'))
            .then(() => loadScript('/potree-build/jstree/jstree.js'))
            .then(() => loadScript('/potree-build/jquery-ui/jquery-ui.min.js'))
            .then(() => loadScript('/potree-build/other/BinaryHeap.js'))
            .then(() => loadScript('/potree-build/tween/tween.min.js'))
            .then(() => loadScript('/potree-build/i18next/i18next.js'))
            .then(() => loadScript('/potree-build/d3/d3.js'))
            .then(() => loadScript('/potree-build/openlayers3/ol.js'))
            .then(() => loadScript('/potree-build/plasio/js/laslaz.js'))
            .then(() => loadScript('/potree-build/geopackage/geopackage.js'))
            .then(() => loadScript('/potree-build/other/stats.js'))
            .then(() => loadScript('/potree-build/Cesium/Cesium.js'))
            .then(() => loadScript('/potree-build/potree/potree.js'))
            .then(() => {
                togglePotreeLoading();
            })
            .catch((err) => console.error(err));
    }, [togglePotreeLoading]);

    return <>{children}</>;
}
