"use client";
import { useEffect, useRef, useState } from "react";
import { Color, Scene, Fog, PerspectiveCamera, Vector3 } from "three";
import ThreeGlobe from "three-globe";
import { useThree, Canvas, extend } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import countries from "@/data/globe.json";
declare module "@react-three/fiber" {
  interface ThreeElements {
    threeGlobe: JSX.IntrinsicElements["group"] & {
      ref?: React.RefObject<ThreeGlobe>;
    };
  }
}

extend({ ThreeGlobe });

const RING_PROPAGATION_SPEED = 3;
const aspect = 1.2;
const cameraZ = 300;

type Position = {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string;
};

export type GlobeConfig = {
  pointSize?: number;
  globeColor?: string;
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereAltitude?: number;
  emissive?: string;
  emissiveIntensity?: number;
  shininess?: number;
  polygonColor?: string;
  ambientLight?: string;
  directionalLeftLight?: string;
  directionalTopLight?: string;
  pointLight?: string;
  arcTime?: number;
  arcLength?: number;
  rings?: number;
  maxRings?: number;
  initialPosition?: {
    lat: number;
    lng: number;
  };
  autoRotate?: boolean;
  autoRotateSpeed?: number;
};

interface WorldProps {
  globeConfig: GlobeConfig;
  data: Position[];
}

let numbersOfRings = [0];

export function Globe({ globeConfig, data }: WorldProps) {
  const [globeData, setGlobeData] = useState<
    | {
        size: number;
        order: number;
        color: (t: number) => string;
        lat: number;
        lng: number;
      }[]
    | null
  >(null);
  const [ready, setReady] = useState(false);
  const globeRef = useRef<ThreeGlobe | null>(null);

  const defaultProps = {
    pointSize: 1,
    atmosphereColor: "#ffffff",
    showAtmosphere: true,
    atmosphereAltitude: 0.1,
    polygonColor: "rgba(255,255,255,0.7)",
    globeColor: "#1d072e",
    emissive: "#000000",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    arcTime: 2000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    ...globeConfig,
  };

  // Validate data to ensure no NaN values
  const validateData = (inputData: Position[]) => {
    return inputData.filter((item) => {
      // Check if any coordinate is NaN, undefined, or null
      if (
        isNaN(item.startLat) ||
        isNaN(item.startLng) ||
        isNaN(item.endLat) ||
        isNaN(item.endLng) ||
        isNaN(item.arcAlt) ||
        item.startLat === undefined ||
        item.startLng === undefined ||
        item.endLat === undefined ||
        item.endLng === undefined ||
        item.arcAlt === undefined
      ) {
        console.warn("Found invalid coordinate data:", item);
        return false;
      }
      return true;
    });
  };

  useEffect(() => {
    // Initialize globe with empty data
    if (!globeRef.current) {
      const globe = new ThreeGlobe()
        .hexPolygonsData([])
        .pointsData([])
        .arcsData([]);

      globeRef.current = globe;
      _buildMaterial();
    }
  }, []);

  useEffect(() => {
    if (globeRef.current && data && data.length > 0) {
      const validData = validateData(data);
      if (validData.length > 0) {
        _buildData(validData);
      } else {
        console.error("No valid data points found for the globe");
      }
    }
  }, [data]);

  const _buildMaterial = () => {
    if (!globeRef.current) return;

    const globeMaterial = globeRef.current.globeMaterial() as unknown as {
      color: Color;
      emissive: Color;
      emissiveIntensity: number;
      shininess: number;
    };
    globeMaterial.color = new Color(
      globeConfig.globeColor || defaultProps.globeColor
    );
    globeMaterial.emissive = new Color(
      globeConfig.emissive || defaultProps.emissive
    );
    globeMaterial.emissiveIntensity =
      globeConfig.emissiveIntensity || defaultProps.emissiveIntensity;
    globeMaterial.shininess = globeConfig.shininess || defaultProps.shininess;
  };

  const _buildData = (validData: Position[]) => {
    let points = [];
    for (let i = 0; i < validData.length; i++) {
      const arc = validData[i];
      const rgb = hexToRgb(arc.color) as { r: number; g: number; b: number };

      if (!rgb) {
        console.warn("Invalid color format:", arc.color);
        continue;
      }

      points.push({
        size: defaultProps.pointSize,
        order: arc.order,
        color: (t: number) => `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${1 - t})`,
        lat: arc.startLat,
        lng: arc.startLng,
      });
      points.push({
        size: defaultProps.pointSize,
        order: arc.order,
        color: (t: number) => `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${1 - t})`,
        lat: arc.endLat,
        lng: arc.endLng,
      });
    }

    // remove duplicates for same lat and lng
    const filteredPoints = points.filter(
      (v, i, a) =>
        a.findIndex((v2) =>
          ["lat", "lng"].every(
            (k) => v2[k as "lat" | "lng"] === v[k as "lat" | "lng"]
          )
        ) === i
    );

    setGlobeData(filteredPoints);
  };

  useEffect(() => {
    if (globeRef.current && globeData && globeData.length > 0) {
      try {
        globeRef.current
          .hexPolygonsData(countries.features)
          .hexPolygonResolution(3)
          .hexPolygonMargin(0.7)
          .showAtmosphere(defaultProps.showAtmosphere)
          .atmosphereColor(defaultProps.atmosphereColor)
          .atmosphereAltitude(defaultProps.atmosphereAltitude)
          .hexPolygonColor(() => defaultProps.polygonColor);

        // Set ready state after initial configuration
        setReady(true);
      } catch (error) {
        console.error("Error configuring globe:", error);
      }
    }
  }, [globeData]);

  useEffect(() => {
    if (ready && globeRef.current && globeData && globeData.length > 0) {
      startAnimation();
    }
  }, [ready, globeData]);

  const startAnimation = () => {
    if (!globeRef.current || !globeData || globeData.length === 0) return;

    try {
      const validData = validateData(data);

      globeRef.current
        .arcsData(validData)
        .arcStartLat((d) => {
          const val = (d as { startLat: number }).startLat * 1;
          return isNaN(val) ? 0 : val;
        })
        .arcStartLng((d) => {
          const val = (d as { startLng: number }).startLng * 1;
          return isNaN(val) ? 0 : val;
        })
        .arcEndLat((d) => {
          const val = (d as { endLat: number }).endLat * 1;
          return isNaN(val) ? 0 : val;
        })
        .arcEndLng((d) => {
          const val = (d as { endLng: number }).endLng * 1;
          return isNaN(val) ? 0 : val;
        })
        .arcColor((e: any) => (e as { color: string }).color)
        .arcAltitude((e) => {
          const val = (e as { arcAlt: number })?.arcAlt * 1;
          return isNaN(val) ? 0.1 : val;
        })
        .arcStroke(() => {
          return [0.32, 0.28, 0.3][Math.round(Math.random() * 2)];
        })
        .arcDashLength(defaultProps.arcLength)
        .arcDashInitialGap((e) => {
          const val = (e as { order: number }).order * 1;
          return isNaN(val) ? 0 : val;
        })
        .arcDashGap(15)
        .arcDashAnimateTime(() => defaultProps.arcTime);

      globeRef.current
        .pointsData(globeData)
        .pointColor((e) => (e as { color: (t: number) => string }).color(0))
        .pointsMerge(true)
        .pointAltitude(0.0)
        .pointRadius(2);

      // Initialize rings with empty data first
      globeRef.current
        .ringsData([])
        .ringColor((e: any) => (t: any) => e.color(t))
        .ringMaxRadius(defaultProps.maxRings)
        .ringPropagationSpeed(RING_PROPAGATION_SPEED)
        .ringRepeatPeriod(
          (defaultProps.arcTime * defaultProps.arcLength) / defaultProps.rings
        );
    } catch (error) {
      console.error("Error in startAnimation:", error);
    }
  };

  useEffect(() => {
    if (!ready || !globeRef.current || !globeData || globeData.length === 0)
      return;

    const interval = setInterval(() => {
      if (!globeRef.current || !globeData) return;
      try {
        // Generate a safe number of rings
        const maxItems = Math.min(globeData.length, 100); // Limit to avoid performance issues
        const ringsCount = Math.floor((maxItems * 4) / 5);
        numbersOfRings = genRandomNumbers(
          0,
          maxItems,
          ringsCount > 0 ? ringsCount : 1
        );

        // Only use indices that exist in the data
        const safeRingItems = globeData.filter((_, i) =>
          numbersOfRings.includes(i)
        );

        if (safeRingItems.length > 0) {
          globeRef.current.ringsData(safeRingItems);
        }
      } catch (error) {
        console.error("Error updating rings:", error);
      }
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [ready, globeData]);

  return (
    <>{globeRef.current && ready && <primitive object={globeRef.current} />}</>
  );
}

export function WebGLRendererConfig() {
  const { gl, size } = useThree();

  useEffect(() => {
    gl.setPixelRatio(window.devicePixelRatio);
    gl.setSize(size.width, size.height);
    gl.setClearColor(0xffaaff, 0);
  }, []);

  return null;
}

export function World(props: WorldProps) {
  const { globeConfig } = props;
  const scene = new Scene();
  scene.fog = new Fog(0xffffff, 400, 2000);
  return (
    <Canvas scene={scene} camera={new PerspectiveCamera(50, aspect, 180, 1800)}>
      <WebGLRendererConfig />
      <ambientLight color={globeConfig.ambientLight} intensity={0.6} />
      <directionalLight
        color={globeConfig.directionalLeftLight}
        position={new Vector3(-400, 100, 400)}
      />
      <directionalLight
        color={globeConfig.directionalTopLight}
        position={new Vector3(-200, 500, 200)}
      />
      <pointLight
        color={globeConfig.pointLight}
        position={new Vector3(-200, 500, 200)}
        intensity={0.8}
      />
      <Globe {...props} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minDistance={cameraZ}
        maxDistance={cameraZ}
        autoRotateSpeed={1}
        autoRotate={true}
        minPolarAngle={Math.PI / 3.5}
        maxPolarAngle={Math.PI - Math.PI / 3}
      />
    </Canvas>
  );
}

export function hexToRgb(hex: string) {
  if (!hex || typeof hex !== "string") {
    return null;
  }

  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function genRandomNumbers(min: number, max: number, count: number) {
  // Ensure parameters are valid
  min = Math.max(0, min);
  max = Math.max(min + 1, max);
  count = Math.min(max - min, count);

  const arr: number[] = [];
  if (count <= 0) return arr;

  // If range is too small for requested count, return all numbers in range
  if (max - min <= count) {
    for (let i = min; i < max; i++) {
      arr.push(i);
    }
    return arr;
  }

  // Generate random unique numbers
  while (arr.length < count) {
    const r = Math.floor(Math.random() * (max - min)) + min;
    if (arr.indexOf(r) === -1) arr.push(r);
  }

  return arr;
}
