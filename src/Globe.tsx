import { Suspense, lazy, useState, useCallback } from 'react';
import type { GlobeTheme, PointItem } from './theme/GlobeTheme';
import type { ArcDatum, ArcLayerConfig } from './layers/ArcLayer';
import type { TrailDatum, TrailLayerConfig } from './layers/TrailLayer';
import type { GlobeSceneRefs } from './GlobeScene';
import { useResolvedTheme } from './GlobeRoot';
import { LoadingOrb } from './ui/LoadingOrb';

// ---------------------------------------------------------------------------
// Globe — public-facing wrapper component.
// Lazy-loads the heavy GlobeScene chunk so the host page can render static
// HTML and the loading skeleton first. Theme from prop or <GlobeRoot>.
// ---------------------------------------------------------------------------

const GlobeScene = lazy(() => import('./GlobeScene'));

export interface GlobeProps {
  theme?: GlobeTheme;
  points?: PointItem[];
  /** Arcs connecting two points (migration routes, connections). */
  arcs?: ArcDatum[];
  /** Arc layer defaults. */
  arcConfig?: ArcLayerConfig;
  /** Multi-waypoint trails with directional flow animation. */
  trails?: TrailDatum[];
  /** Trail layer defaults. */
  trailConfig?: TrailLayerConfig;
  onPointClick?: (point: PointItem) => void;
  /** Called when an arc is clicked. Receives the arc's label. */
  onArcClick?: (label: string) => void;
  onCameraChange?: (distance: number) => void;
  /** Called once after Three.js scene is initialized. Provides refs for custom layers. */
  onSceneReady?: (refs: GlobeSceneRefs) => void;
  /** Called every animation frame with delta time (seconds). */
  onFrame?: (dt: number) => void;
}

export function Globe({
  theme: themeProp,
  points = [],
  arcs,
  arcConfig,
  trails,
  trailConfig,
  onPointClick,
  onArcClick,
  onCameraChange,
  onSceneReady,
  onFrame,
}: GlobeProps) {
  const theme = useResolvedTheme(themeProp);
  const [sceneError, setSceneError] = useState<string | null>(null);

  const handleError = useCallback((error: Error) => {
    console.error('[Globe] Failed to load scene:', error);
    setSceneError('Failed to load 3D globe. Please refresh the page.');
  }, []);

  if (sceneError) {
    return (
      <div className="og-orb" data-og="globe-error">
        <span style={{
          color: 'var(--og-text-secondary)',
          fontFamily: 'var(--og-font-body)',
          fontSize: 'var(--og-text-sm)',
        }}>
          {sceneError}
        </span>
      </div>
    );
  }

  return (
    <ErrorBoundary onError={handleError}>
      <Suspense fallback={<LoadingOrb />}>
        <GlobeScene
          theme={theme}
          points={points}
          arcs={arcs}
          arcConfig={arcConfig}
          trails={trails}
          trailConfig={trailConfig}
          onPointClick={onPointClick}
          onArcClick={onArcClick}
          onCameraChange={onCameraChange}
          onSceneReady={onSceneReady}
          onFrame={onFrame}
        />
      </Suspense>
    </ErrorBoundary>
  );
}

// ---------------------------------------------------------------------------
// Minimal error boundary — catches chunk load failures.
// ---------------------------------------------------------------------------

import { Component, type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  onError: (error: Error) => void;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
