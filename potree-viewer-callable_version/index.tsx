'use client';

import CesiumArea from './_components/cesium-area';
import Dependency from './_components/dependency';
import InitialHook from './_components/initial-hook';
import RenderArea from './_components/render-area';
import UpdateHook from './_components/update-hook';
import { type PotreeViewerProps, PotreeViewerProvider } from './store';
import './style.css';

type PotreeViewer = {
    children?: React.ReactNode;
    renderAreaChildren?: React.ReactNode;

    noCesium?: boolean;
    noAutoFocus?: boolean;
} & PotreeViewerProps;

export default function PotreeViewer(props: PotreeViewer) {
    const {
        children,
        renderAreaChildren,

        url,
        containerId,
        sidebar,
        pointBudget,
        noCesium,
        noAutoFocus,
    } = props;
    const zone = props.zone || '47';

    return (
        <PotreeViewerProvider
            url={url}
            containerId={containerId || 'potree_render_area'}
            sidebar={sidebar || false}
            zone={zone}
            pointBudget={pointBudget}
        >
            <Dependency>
                <InitialHook />
                <UpdateHook noAutoFocus={noAutoFocus} />

                {!noCesium && <CesiumArea />}
                <RenderArea>{renderAreaChildren}</RenderArea>

                {children}
            </Dependency>
        </PotreeViewerProvider>
    );
}
