import type ThreeGlobe from 'three-globe';

// ---------------------------------------------------------------------------
// ArcLayer — animated arcs between two points on the globe surface.
//
// Each arc is a quadratic bezier curve elevated above the globe.
// Supports gradient colors, configurable elevation, dash patterns,
// and a glowing particle that travels along the arc path.
//
// Uses three-globe's built-in arcs layer. Each ArcDatum produces two
// entries in arcsData: the visible body arc and a traveling glow particle.
// ---------------------------------------------------------------------------

/** A single arc connecting two points on the globe. */
export interface ArcDatum {
  id?: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  /** Single color string, or [startColor, endColor] for gradient. */
  color?: string | [string, string];
  /** Optional label (available for tooltip/selection logic). */
  label?: string;
  /** Stroke width. Default: from config or 0.8. */
  width?: number;
  /** Altitude above globe surface (fraction of globe radius). null = auto. */
  elevation?: number | null;
  /** Dash segment length. 0 = solid. Default: 0 (solid). */
  dashLength?: number;
  /** Gap between dashes. Default: 0. */
  dashGap?: number;
  /** Dash animation time in ms (one full cycle). 0 = static. Default: 0. */
  speed?: number;
  /** Show traveling glow particle. Default: true. */
  particle?: boolean;
  /** Color of the traveling particle. Default: white. */
  particleColor?: string;
  /** Speed of the traveling particle in ms. Default: 2000. */
  particleSpeed?: number;
}

/** Default config applied to all arcs in the layer. */
export interface ArcLayerConfig {
  color?: string | [string, string];
  width?: number;
  elevation?: number | null;
  dashLength?: number;
  dashGap?: number;
  speed?: number;
  particle?: boolean;
  particleColor?: string;
  particleSpeed?: number;
  /** Bezier curve segment count. Higher = smoother. Default: 64. */
  curveResolution?: number;
  /** Tube cross-section segments. Default: 6. */
  circularResolution?: number;
  /** Transition animation duration when data changes. Default: 500. */
  transitionDuration?: number;
}

const DEFAULTS: Required<ArcLayerConfig> = {
  color: ['rgba(76,201,240,0.6)', 'rgba(76,201,240,0.15)'],
  width: 0.8,
  elevation: null,
  dashLength: 0,
  dashGap: 0,
  speed: 0,
  particle: true,
  particleColor: 'rgba(255,255,255,0.9)',
  particleSpeed: 2000,
  curveResolution: 64,
  circularResolution: 6,
  transitionDuration: 500,
};

// Internal arc entry passed to three-globe
interface ArcEntry {
  _type: 'body' | 'particle';
  _source: ArcDatum;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string | [string, string];
  stroke: number;
  altitude: number | null;
  dashLen: number;
  dashGap: number;
  dashAnimateTime: number;
}

function resolveColor(
  datum: ArcDatum,
  cfg: Required<ArcLayerConfig>,
): string | [string, string] {
  return datum.color ?? cfg.color;
}

/**
 * Build the internal arcsData array from user-facing ArcDatum[].
 * Each datum produces 1 body arc + optionally 1 particle arc.
 */
function buildArcsData(
  data: ArcDatum[],
  cfg: Required<ArcLayerConfig>,
): ArcEntry[] {
  const entries: ArcEntry[] = [];

  for (const d of data) {
    const color = resolveColor(d, cfg);
    const width = d.width ?? cfg.width;
    const elevation = d.elevation !== undefined ? d.elevation : cfg.elevation;
    const dashLen = d.dashLength ?? cfg.dashLength;
    const dashGap = d.dashGap ?? cfg.dashGap;
    const speed = d.speed ?? cfg.speed;

    // Body arc
    entries.push({
      _type: 'body',
      _source: d,
      startLat: d.startLat,
      startLng: d.startLng,
      endLat: d.endLat,
      endLng: d.endLng,
      color,
      stroke: width,
      altitude: elevation,
      dashLen,
      dashGap,
      dashAnimateTime: speed,
    });

    // Traveling glow particle — a tiny bright dash that moves along the arc
    const showParticle = d.particle ?? cfg.particle;
    if (showParticle) {
      const pColor = d.particleColor ?? cfg.particleColor;
      const pSpeed = d.particleSpeed ?? cfg.particleSpeed;
      entries.push({
        _type: 'particle',
        _source: d,
        startLat: d.startLat,
        startLng: d.startLng,
        endLat: d.endLat,
        endLng: d.endLng,
        color: pColor,
        stroke: width * 1.5,
        altitude: elevation,
        dashLen: 0.05,
        dashGap: 2,
        dashAnimateTime: pSpeed,
      });
    }
  }

  return entries;
}

/**
 * Apply the ArcLayer to a ThreeGlobe instance.
 *
 * Call this whenever arc data or config changes. Pass an empty array to clear.
 */
export function applyArcLayer(
  globe: ThreeGlobe,
  data: ArcDatum[],
  config?: ArcLayerConfig,
): void {
  const cfg = { ...DEFAULTS, ...config };
  const entries = buildArcsData(data, cfg);

  globe
    .arcsData(entries)
    .arcStartLat('startLat')
    .arcStartLng('startLng')
    .arcEndLat('endLat')
    .arcEndLng('endLng')
    .arcColor((d: object) => (d as ArcEntry).color)
    .arcStroke((d: object) => (d as ArcEntry).stroke)
    .arcAltitude((d: object) => (d as ArcEntry).altitude)
    .arcDashLength((d: object) => (d as ArcEntry).dashLen)
    .arcDashGap((d: object) => (d as ArcEntry).dashGap)
    .arcDashAnimateTime((d: object) => (d as ArcEntry).dashAnimateTime)
    .arcCurveResolution(cfg.curveResolution)
    .arcCircularResolution(cfg.circularResolution)
    .arcsTransitionDuration(cfg.transitionDuration);
}
