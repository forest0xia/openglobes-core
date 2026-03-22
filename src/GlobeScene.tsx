import { useEffect, useRef, useCallback } from 'react';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
  Vector2,
  Raycaster,
  TextureLoader,
  Color,
  MeshPhongMaterial,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import ThreeGlobe from 'three-globe';
import type { GlobeTheme, PointItem } from './theme/GlobeTheme';
import { applyArcLayer, type ArcDatum, type ArcLayerConfig } from './layers/ArcLayer';
import { applyTrailLayer, type TrailDatum, type TrailLayerConfig } from './layers/TrailLayer';

/** Refs passed to onSceneReady for advanced custom layers. */
export interface GlobeSceneRefs {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  controls: OrbitControls;
  globe: ThreeGlobe;
  /** Convert lat/lng/alt to scene-space {x,y,z}. alt is fraction of globe radius (0 = surface). */
  getCoords: (lat: number, lng: number, alt?: number) => { x: number; y: number; z: number };
}

// ---------------------------------------------------------------------------
// GlobeScene — the Three.js scene that renders the 3D globe.
// This component is code-split via React.lazy in Globe.tsx.
// ---------------------------------------------------------------------------

interface GlobeSceneProps {
  theme: GlobeTheme;
  /** Points to render (from useSpatialIndex or sample data). */
  points: PointItem[];
  /** Arcs connecting two points (migration routes, connections). */
  arcs?: ArcDatum[];
  /** Arc layer defaults. */
  arcConfig?: ArcLayerConfig;
  /** Multi-waypoint trails with directional flow animation. */
  trails?: TrailDatum[];
  /** Trail layer defaults. */
  trailConfig?: TrailLayerConfig;
  /** Called when a point is clicked. */
  onPointClick?: (point: PointItem) => void;
  /** Called when an arc is clicked. Receives the arc's label. */
  onArcClick?: (label: string) => void;
  /** Called every frame with camera distance — hook useSpatialIndex into this. */
  onCameraChange?: (distance: number) => void;
  /** Called once after the Three.js scene is initialized. Provides refs for custom layers. */
  onSceneReady?: (refs: GlobeSceneRefs) => void;
  /** Called on every animation frame with delta time. Use for custom layer updates. */
  onFrame?: (dt: number) => void;
}

export default function GlobeScene({
  theme,
  points,
  arcs = [],
  arcConfig,
  trails = [],
  trailConfig,
  onPointClick,
  onArcClick,
  onCameraChange,
  onSceneReady,
  onFrame,
}: GlobeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<ThreeGlobe | null>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const frameIdRef = useRef<number>(0);

  // Refs for values accessed in the animation loop (avoids stale closures)
  const onCameraChangeRef = useRef(onCameraChange);
  onCameraChangeRef.current = onCameraChange;

  const onPointClickRef = useRef(onPointClick);
  onPointClickRef.current = onPointClick;

  const onArcClickRef = useRef(onArcClick);
  onArcClickRef.current = onArcClick;

  const onSceneReadyRef = useRef(onSceneReady);
  onSceneReadyRef.current = onSceneReady;

  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  // --- Set up Three.js scene once on mount ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new Scene();

    // Camera
    const camera = new PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      1,
      2000,
    );
    camera.position.z = 350;
    cameraRef.current = camera;

    // Renderer
    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(theme.backgroundColor);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    scene.add(new AmbientLight(0xcccccc, Math.PI));
    const dirLight = new DirectionalLight(0xffffff, 0.6 * Math.PI);
    dirLight.position.set(1, 1, 1);
    scene.add(dirLight);

    // Globe
    const globe = new ThreeGlobe({ animateIn: true })
      .globeImageUrl(theme.globeTexture)
      .showAtmosphere(true)
      .atmosphereColor(theme.atmosphereColor)
      .atmosphereAltitude(0.2)
      .rendererSize(new Vector2(container.clientWidth, container.clientHeight));
    scene.add(globe);
    globeRef.current = globe;

    // Terrain: bump, specular, and displacement maps
    const terrain = theme.terrain;
    if (terrain) {
      // Enhance globe material with terrain textures
      // three-globe types return base Material, but runtime is MeshPhongMaterial
      const globeMaterial = globe.globeMaterial() as MeshPhongMaterial;

      if (terrain.bumpMap) {
        globe.bumpImageUrl(terrain.bumpMap);
        globeMaterial.bumpScale = terrain.bumpScale ?? 10;
      }

      // Increase polygon count when displacement is enabled
      const dScale = terrain.displacementScale;
      if (dScale != null && dScale > 0) {
        globe.globeCurvatureResolution(terrain.curvatureResolution ?? 1);
      } else if (terrain.curvatureResolution) {
        globe.globeCurvatureResolution(terrain.curvatureResolution);
      }

      const textureLoader = new TextureLoader();
      const onTexError = (url: string) => (err: unknown) => {
        console.warn(`[openglobes] Failed to load terrain texture: ${url}`, err);
      };

      if (terrain.specularMap) {
        textureLoader.load(terrain.specularMap, (texture) => {
          globeMaterial.specularMap = texture;
          globeMaterial.specular = new Color(terrain.specular ?? 'grey');
          globeMaterial.shininess = terrain.shininess ?? 15;
          globeMaterial.needsUpdate = true;
        }, undefined, onTexError(terrain.specularMap));
      }

      if (terrain.displacementMap && dScale != null && dScale > 0) {
        textureLoader.load(terrain.displacementMap, (texture) => {
          globeMaterial.displacementMap = texture;
          globeMaterial.displacementScale = dScale;
          globeMaterial.needsUpdate = true;
        }, undefined, onTexError(terrain.displacementMap));
      }
    }

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.8;
    controls.minDistance = 120;
    controls.maxDistance = 500;
    controls.enablePan = false;
    // Touch: passive listeners are set by OrbitControls internally
    controlsRef.current = controls;

    // Auto-rotation
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;

    // Stop auto-rotate on interaction
    const stopAutoRotate = () => {
      controls.autoRotate = false;
    };
    renderer.domElement.addEventListener('pointerdown', stopAutoRotate, {
      passive: true,
    });

    // Notify consumer that the scene is ready for custom layers
    const getCoords = (lat: number, lng: number, alt = 0) => {
      return (globe as unknown as { getCoords: (lat: number, lng: number, alt: number) => { x: number; y: number; z: number } })
        .getCoords(lat, lng, alt);
    };
    onSceneReadyRef.current?.({ scene, camera, renderer, controls, globe, getCoords });

    // Animation loop
    let lastTime = performance.now();
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = (now - lastTime) / 1000; // seconds
      lastTime = now;

      controls.update();
      globe.setPointOfView(camera);
      onFrameRef.current?.(dt);
      renderer.render(scene, camera);

      // Report camera distance for spatial indexing
      const dist = camera.position.length();
      onCameraChangeRef.current?.(dist);
    };
    animate();

    // Resize handler
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      globe.rendererSize(new Vector2(w, h));
    };
    window.addEventListener('resize', onResize, { passive: true });

    // Cleanup
    return () => {
      cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', stopAutoRotate);
      controls.dispose();
      renderer.dispose();
      globe._destructor();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
    // Only run on mount — theme changes require a remount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Update points when data changes ---
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    globe
      .pointsData(points)
      .pointLat('lat')
      .pointLng('lng')
      .pointColor((d: object) => theme.pointColor(d as PointItem))
      .pointRadius((d: object) => theme.pointSize(d as PointItem))
      .pointAltitude(0.001)
      .pointsMerge(points.length > 5000)
      .pointsTransitionDuration(400);

    // Point click is handled via the container's onClick → raycasting
  }, [points, theme]);

  // --- Update arcs when data changes ---
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    applyArcLayer(globe, arcs, arcConfig);
  }, [arcs, arcConfig]);

  // --- Update trails when data changes ---
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    applyTrailLayer(globe, trails, trailConfig);
  }, [trails, trailConfig]);

  // --- Handle point clicks by finding the nearest point to the click ---
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onPointClickRef.current || points.length === 0) return;
      const camera = cameraRef.current;
      const globe = globeRef.current;
      if (!camera || !globe) return;

      // Ignore drags — only handle clicks where pointer barely moved
      if (pointerDownPos.current) {
        const dx = e.clientX - pointerDownPos.current.x;
        const dy = e.clientY - pointerDownPos.current.y;
        if (dx * dx + dy * dy > 25) return; // >5px = drag, not click
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycast against the globe sphere to get a lat/lng
      const raycaster = new Raycaster();
      raycaster.setFromCamera(new Vector2(ndcX, ndcY), camera);
      const intersects = raycaster.intersectObject(globe, true);
      if (intersects.length === 0) return;

      // Convert intersection point to lat/lng
      const hit = intersects[0];
      if (!hit) return;
      const hitPoint = hit.point;
      // Globe radius is ~100 units. Convert cartesian to spherical.
      const r = Math.sqrt(hitPoint.x ** 2 + hitPoint.y ** 2 + hitPoint.z ** 2);
      const hitLat = Math.asin(hitPoint.y / r) * (180 / Math.PI);
      const hitLng = Math.atan2(hitPoint.x, hitPoint.z) * (180 / Math.PI);

      // Find the closest point — threshold scales with camera distance.
      // Close zoom (dist~120) → tight threshold (~1°). Far zoom (dist~500) → looser (~4°).
      const camDist = camera.position.length();
      const threshold = Math.max(0.5, Math.min(4, (camDist - 100) / 100));
      let bestDist = Infinity;
      let bestPoint: PointItem | null = null;

      for (const p of points) {
        const dLat = p.lat - hitLat;
        const dLng = p.lng - hitLng;
        const dist = dLat * dLat + dLng * dLng;
        if (dist < bestDist && dist < threshold * threshold) {
          bestDist = dist;
          bestPoint = p;
        }
      }

      if (bestPoint) {
        onPointClickRef.current(bestPoint);
        return;
      }

      // No point found — check if click is near a trail/arc path
      if (onArcClickRef.current && arcs.length > 0) {
        let bestArcDist = Infinity;
        let bestArcLabel: string | null = null;
        const arcThreshold = Math.max(1, threshold * 1.5);

        for (const arc of arcs) {
          if (!arc.label) continue;
          // Simple proximity: check distance to both endpoints and midpoint
          const midLat = (arc.startLat + arc.endLat) / 2;
          const midLng = (arc.startLng + arc.endLng) / 2;
          const checkPoints: [number, number][] = [[arc.startLat, arc.startLng], [arc.endLat, arc.endLng], [midLat, midLng]];
          for (const cp of checkPoints) {
            const dLat = cp[0] - hitLat;
            const dLng = cp[1] - hitLng;
            const dist = Math.sqrt(dLat * dLat + dLng * dLng);
            if (dist < bestArcDist && dist < arcThreshold) {
              bestArcDist = dist;
              bestArcLabel = arc.label;
            }
          }
        }

        if (bestArcLabel) {
          onArcClickRef.current(bestArcLabel);
        }
      }
    },
    [points, arcs],
  );

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minHeight: '50vh',
    position: 'relative',
    overflow: 'hidden',
    touchAction: 'none', // let OrbitControls handle all gestures
    backgroundColor: theme.backgroundColor,
  };

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    />
  );
}
