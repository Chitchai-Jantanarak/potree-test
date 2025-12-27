import { usePotreeViewer } from '../store';

interface RenderAreaProps {
    children?: React.ReactNode;
}

export default function RenderArea(props: RenderAreaProps) {
    const { children } = props;
    const id = usePotreeViewer((s) => s.containerId);

    return (
        <div className="potree_container absolute left-0 top-0 h-full w-full">
            <div
                id={id}
                className="potree_render_area_class absolute bottom-0 left-0 right-0 top-0 z-[1] overflow-hidden"
                style={{
                    transition: 'left .35s',
                    backgroundImage:
                        "url('/potree-build/potree/resources/images/background.jpg')",
                }}
            >
                {children}

                <div
                    id={`cesium_container_${id}`}
                    className="absolute h-full w-full bg-primary"
                    // style={{
                    //     filter: 'brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7)',
                    // }}
                />
            </div>
            <div
                id={`potree_sidebar_container_${id}`}
                className="potree_sidebar_container"
            />
        </div>
    );
}
