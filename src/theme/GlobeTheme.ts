// ---------------------------------------------------------------------------
// GlobeTheme — the single type that drives every globe's look and behavior.
// Globe-specific repos provide a concrete theme object; @openglobes/core
// renders everything from it.
// ---------------------------------------------------------------------------

/** A data point rendered on the globe surface. */
export interface PointItem {
  id: string;
  lat: number;
  lng: number;
  name: string;
  nameZh?: string;
  rarity?: number;
  [key: string]: unknown; // globe-specific extra fields
}

/** A cluster of points at low zoom. */
export interface ClusterItem {
  lat: number;
  lng: number;
  count: number;
  topItems: { id: string; name: string }[];
}

/** Filter UI configuration — drives FilterPanel rendering. */
export interface FilterConfig {
  key: string;
  label: string;
  type: 'chips' | 'range' | 'toggle';
  options?: string[];
  min?: number;
  max?: number;
  unit?: string;
}

/** A field shown in the DetailDrawer when a point is selected. */
export interface DetailFieldConfig {
  key: string;
  label: string;
  format?: 'text' | 'number' | 'url' | 'image';
}

/** Data source credit (legally required for many datasets). */
export interface Attribution {
  name: string;
  url: string;
  license: string;
}

/** Link shown in DetailDrawer to external resources. */
export interface ExternalLink {
  label: string;
  url: string;
}

/** Terrain rendering configuration — bump, specular, and displacement maps. */
export interface TerrainConfig {
  /** URL to equirectangular height grayscale texture (white = high, black = low). */
  bumpMap?: string;
  /** Intensity of bump lighting effect. Default: 10. */
  bumpScale?: number;
  /** URL to specular map (white = shiny ocean, black = rough land). */
  specularMap?: string;
  /** Specular highlight color. Default: 'grey'. */
  specular?: string;
  /** Specular sharpness (higher = tighter highlights). Default: 15. */
  shininess?: number;
  /** URL to displacement texture (deforms geometry). Often same image as bumpMap. */
  displacementMap?: string;
  /** Vertex displacement amount. 0 = disabled. Values 3-5 = stylized exaggeration. Default: 0. */
  displacementScale?: number;
  /** Globe polygon density in degrees. Auto-set to 1 when displacement > 0. Lower = more polygons. */
  curvatureResolution?: number;
}

/** Full theme interface — one per globe. */
export interface GlobeTheme {
  id: string;
  name: string;
  tagline: string;

  // Globe appearance
  globeTexture: string;
  atmosphereColor: string;
  backgroundColor: string;
  /** Optional terrain rendering (bump, specular, displacement maps). */
  terrain?: TerrainConfig;

  // Data layer styling
  pointColor: (item: PointItem) => string;
  pointSize: (item: PointItem) => number;
  clusterColor: (count: number) => string;

  // UI colors
  colors: {
    primary: string;
    surface: string;
    text: string;
    textMuted: string;
    accent: string;
    gradient: [string, string];
  };

  // Typography
  fonts: {
    display: string;
    body: string;
    mono: string;
  };

  // Dynamic config
  filters: FilterConfig[];
  detailFields: DetailFieldConfig[];
  attribution: Attribution[];
  externalLinks: (item: PointItem) => ExternalLink[];
}
