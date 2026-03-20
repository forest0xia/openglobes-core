import type ThreeGlobe from 'three-globe';

// ---------------------------------------------------------------------------
// TrailLayer — animated dashed lines showing directional flow between
// connected waypoints. "Ants marching" effect.
//
// Uses three-globe's built-in paths layer with dash animation.
// Each TrailDatum defines a multi-waypoint path. Dashes animate
// along the path to show direction of travel/flow.
// ---------------------------------------------------------------------------

/** A single waypoint along a trail. */
export interface TrailWaypoint {
  lat: number;
  lng: number;
  /** Altitude above surface (fraction of globe radius). Default: 0. */
  alt?: number;
}

/** A trail connecting multiple waypoints with animated directional flow. */
export interface TrailDatum {
  id?: string;
  /** Ordered array of waypoints defining the trail path. */
  waypoints: TrailWaypoint[];
  /** Single color or array of colors for gradient along the path. */
  color?: string | string[];
  /** Optional label (available for tooltip/selection logic). */
  label?: string;
  /** Stroke width. Default: from config or 1.0. */
  width?: number;
  /** Length of each dash segment. Default: 0.3. */
  dashLength?: number;
  /** Gap between dashes. Default: 0.15. */
  dashGap?: number;
  /**
   * Animation time in ms for dashes to travel one full path length.
   * Positive = forward along waypoint order. Negative = reverse.
   * Default: 5000.
   */
  speed?: number;
  /** Altitude of path segments. Default: 0.005 (just above surface). */
  altitude?: number;
}

/** Default config applied to all trails in the layer. */
export interface TrailLayerConfig {
  color?: string | string[];
  width?: number;
  dashLength?: number;
  dashGap?: number;
  speed?: number;
  altitude?: number;
  /** Path segment resolution. Higher = smoother curves. Default: 2. */
  resolution?: number;
  /** Transition animation duration when data changes. Default: 500. */
  transitionDuration?: number;
}

const DEFAULTS: Required<TrailLayerConfig> = {
  color: ['rgba(76,201,240,0.5)', 'rgba(76,201,240,0.15)'],
  width: 1.0,
  dashLength: 0.3,
  dashGap: 0.15,
  speed: 5000,
  altitude: 0.005,
  resolution: 2,
  transitionDuration: 500,
};

// Internal path entry passed to three-globe
interface PathEntry {
  _source: TrailDatum;
  points: { lat: number; lng: number; alt: number }[];
  color: string | string[];
  stroke: number;
  dashLen: number;
  dashGap: number;
  dashAnimateTime: number;
}

function buildPathsData(
  data: TrailDatum[],
  cfg: Required<TrailLayerConfig>,
): PathEntry[] {
  return data.map((d) => {
    const alt = d.altitude ?? cfg.altitude;
    return {
      _source: d,
      points: d.waypoints.map((wp) => ({
        lat: wp.lat,
        lng: wp.lng,
        alt: wp.alt ?? alt,
      })),
      color: d.color ?? cfg.color,
      stroke: d.width ?? cfg.width,
      dashLen: d.dashLength ?? cfg.dashLength,
      dashGap: d.dashGap ?? cfg.dashGap,
      dashAnimateTime: d.speed ?? cfg.speed,
    };
  });
}

/**
 * Apply the TrailLayer to a ThreeGlobe instance.
 *
 * Call this whenever trail data or config changes. Pass an empty array to clear.
 */
export function applyTrailLayer(
  globe: ThreeGlobe,
  data: TrailDatum[],
  config?: TrailLayerConfig,
): void {
  const cfg = { ...DEFAULTS, ...config };
  const entries = buildPathsData(data, cfg);

  globe
    .pathsData(entries)
    .pathPoints('points')
    .pathPointLat('lat')
    .pathPointLng('lng')
    .pathPointAlt('alt')
    .pathColor((d: object) => (d as PathEntry).color)
    .pathStroke((d: object) => (d as PathEntry).stroke)
    .pathDashLength((d: object) => (d as PathEntry).dashLen)
    .pathDashGap((d: object) => (d as PathEntry).dashGap)
    .pathDashAnimateTime((d: object) => (d as PathEntry).dashAnimateTime)
    .pathResolution(cfg.resolution)
    .pathTransitionDuration(cfg.transitionDuration);
}
