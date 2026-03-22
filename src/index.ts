// ---------------------------------------------------------------------------
// @openglobes/core — public API
// ---------------------------------------------------------------------------

// Theme provider
export { GlobeRoot, useGlobeTheme } from './GlobeRoot';

// Main component
export { Globe } from './Globe';
export type { GlobeProps } from './Globe';
export type { GlobeSceneRefs } from './GlobeScene';

// Theme types
export type {
  GlobeTheme,
  TerrainConfig,
  FilterConfig,
  DetailFieldConfig,
  Attribution,
  ExternalLink,
  PointItem,
  ClusterItem,
} from './theme/GlobeTheme';

// UI components
export { LoadingOrb } from './ui/LoadingOrb';
export { FilterPanel } from './ui/FilterPanel';
export { DetailDrawer } from './ui/DetailDrawer';
export type { DetailData } from './ui/DetailDrawer';
export { SearchBar } from './ui/SearchBar';
export { MobileSheet } from './ui/MobileSheet';
export type { MobileSheetProps } from './ui/MobileSheet';
export { ZoomControls } from './ui/ZoomControls';

// Layers
export { applyArcLayer } from './layers/ArcLayer';
export type { ArcDatum, ArcLayerConfig } from './layers/ArcLayer';
export { applyTrailLayer } from './layers/TrailLayer';
export type { TrailDatum, TrailWaypoint, TrailLayerConfig } from './layers/TrailLayer';

// Hooks
export { useSpatialIndex } from './hooks/useSpatialIndex';
export { useResponsive } from './hooks/useResponsive';

// Utilities
export {
  cameraDistanceToZoom,
  latLngToTile,
  tilesForViewport,
  tileFilename,
} from './utils/tileIndex';
export type { TileCoord, ViewportBounds } from './utils/tileIndex';

// Sample data (for development / testing)
export { SAMPLE_POINTS, SAMPLE_ARCS, SAMPLE_TRAILS, OCEAN_DARK_THEME } from './sampleData';
