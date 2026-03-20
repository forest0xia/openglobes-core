# Architecture — @openglobes/core

## File structure

```
src/
├── Globe.tsx              # Main wrapper, accepts GlobeTheme, lazy-loads scene
├── GlobeScene.tsx         # Three.js scene (code-split, loaded via React.lazy)
├── layers/
│   ├── PointLayer.ts      # Renders clustered point markers on globe
│   ├── HeatmapLayer.ts    # Density heatmap at low zoom levels
│   └── ArcLayer.ts        # Animated arcs (migration routes, connections)
├── ui/
│   ├── FilterPanel.tsx    # Configurable filter sidebar (desktop) / bottom sheet (mobile)
│   ├── DetailDrawer.tsx   # Slide-out info panel for selected item
│   ├── SearchBar.tsx      # Fuse.js powered client-side search
│   ├── MobileSheet.tsx    # Draggable bottom sheet component
│   ├── ImageCard.tsx      # Lazy-loaded WebP thumbnail with skeleton
│   ├── LoadingOrb.tsx     # Animated sphere skeleton during globe load
│   ├── ZoomControls.tsx   # Touch-friendly +/- buttons
│   └── Attribution.tsx    # Data source credits (legally required)
├── hooks/
│   ├── useSpatialIndex.ts # Fetch JSON tiles by viewport bounds + zoom
│   ├── useCluster.ts      # Supercluster LOD wrapper
│   ├── useLazyData.ts     # Generic fetch + cache + loading state
│   └── useResponsive.ts   # Mobile/tablet/desktop breakpoint hook
├── theme/
│   ├── GlobeTheme.ts      # Theme interface type definition
│   └── presets/
│       ├── ocean-dark.ts   # Deep blue, for fish/ocean globes
│       ├── earth-natural.ts # Terrain, for dino/volcano
│       ├── space-void.ts   # Dark cosmic, for meteor/satellite
│       └── warm-amber.ts   # Warm tones, for shipwreck/heritage
├── utils/
│   ├── tileIndex.ts       # Calculate which tile files to fetch for a viewport
│   ├── colorScale.ts      # Map rarity/magnitude/era to colors
│   └── formatters.ts      # Number, unit, i18n formatting
└── index.ts               # Public API — all exports
```

## Theme system

```typescript
export interface GlobeTheme {
  id: string;                    // 'fish' | 'dino' | 'volcano' | ...
  name: string;                  // Display name: 'FishGlobe'
  tagline: string;

  // Globe appearance
  globeTexture: string;          // URL to equirectangular image
  atmosphereColor: string;
  backgroundColor: string;

  // Data layer styling
  pointColor: (item: any) => string;
  pointSize: (item: any) => number;
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
    display: string;    // Headlines — unique per globe
    body: string;       // Body — consistent across globes
    mono: string;       // Data values
  };

  // Dynamic config
  filters: FilterConfig[];
  detailFields: DetailFieldConfig[];
  attribution: Attribution[];
  externalLinks: (item: any) => ExternalLink[];
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'chips' | 'range' | 'toggle';
  options?: string[];         // for chips
  min?: number; max?: number; // for range
  unit?: string;
}
```

## Data tile contract

Globe repos serve pre-built JSON tile files. Core fetches them by viewport.

### Cluster tile (z0-z3):
```json
{
  "clusters": [
    {"lat": 35.6, "lng": 139.7, "count": 482, "topItems": [{"id":"1","name":"Carp"}]}
  ]
}
```

### Point tile (z4+):
```json
{
  "points": [
    {"id": "1", "lat": 35.6, "lng": 139.7, "name": "Common Carp", "nameZh": "鲤鱼", "rarity": 1}
  ]
}
```

### Detail file (per item, fetched on click):
```json
{
  "id": "1",
  "name": "Common Carp",
  "nameZh": "鲤鱼",
  "scientificName": "Cyprinus carpio",
  "description": "...",
  "metadata": {"maxLength": "120 cm", "habitat": "Freshwater"},
  "images": ["thumb.webp"],
  "links": [{"label": "FishBase", "url": "..."}],
  "attribution": "FishBase (CC-BY-NC)"
}
```

### Master index (per globe):
```json
{
  "globeId": "fish",
  "version": "1.0.0",
  "totalItems": 35000,
  "lastUpdated": "2026-03-19",
  "tileZoomRange": [0, 7],
  "filters": [...]
}
```

## LOD (Level of Detail) system
- Zoom 0-3: show cluster heatmap only (few KB per tile)
- Zoom 4-7: show individual points (max 200 per tile)
- Click on point: fetch detail/{id}.json, show in DetailDrawer

## Responsive layout
- Mobile (< 768px): globe full-screen, filter = bottom sheet, detail = full bottom sheet
- Desktop (≥ 768px): globe center, filter = left sidebar 320px, detail = right sidebar 400px
