"use client";

import { useEffect, useRef } from "react";

const CESIUM_BASE_PATH = "/potree-static/lib/Cesium";

export default function CesiumTestPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const loadCesium = async () => {
      // Load Cesium CSS
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `${CESIUM_BASE_PATH}/Widgets/widgets.css`;
      document.head.appendChild(link);

      // Load Cesium JS
      const script = document.createElement("script");
      script.src = `${CESIUM_BASE_PATH}/Cesium.js`;
      script.onload = () => {
        if (!containerRef.current || !window.Cesium) return;

        const Cesium = window.Cesium;
        Cesium.buildModuleUrl.setBaseUrl(`${CESIUM_BASE_PATH}/`);

        // Create credits container
        let credits = document.getElementById("cesium-credits");
        if (!credits) {
          credits = document.createElement("div");
          credits.id = "cesium-credits";
          credits.style.display = "none";
          document.body.appendChild(credits);
        }

        // Create Cesium viewer with DEFAULT render loop (normal controls)
        const cesiumViewer = new Cesium.Viewer(
          containerRef.current as unknown as string,
          {
            useDefaultRenderLoop: true, // Enable normal Cesium controls
            animation: false,
            baseLayerPicker: false,
            fullscreenButton: false,
            geocoder: false,
            homeButton: true, // Enable home button for testing
            infoBox: false,
            sceneModePicker: true, // Enable scene mode picker for testing
            selectionIndicator: false,
            timeline: false,
            navigationHelpButton: true, // Enable nav help
            imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
              url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
            }),
            creditContainer: credits,
          },
        );

        viewerRef.current = cesiumViewer;

        cesiumViewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(-122.4194, 37.7749, 50000),
          duration: 2,
        });

        console.log("[CesiumTest] Cesium viewer created successfully");
      };
      document.head.appendChild(script);
    };

    loadCesium();

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="relative h-screen w-screen">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
