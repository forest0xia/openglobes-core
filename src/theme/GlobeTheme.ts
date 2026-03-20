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

/** Full theme interface — one per globe. */
export interface GlobeTheme {
  id: string;
  name: string;
  tagline: string;

  // Globe appearance
  globeTexture: string;
  atmosphereColor: string;
  backgroundColor: string;

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
