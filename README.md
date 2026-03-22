# @openglobes/core

Reusable React + Three.js 3D globe engine for data visualization. Published as `@openglobes/core` on npm. Globe-specific repos (openglobes-fish, openglobes-dino, etc.) install this package and provide their own data + theme.

Built with [three-globe](https://github.com/vasturiano/three-globe) for direct Three.js control, React 19 for lazy-loading, and a glassmorphism design system.

## Globes built with this engine

| Globe | URL | Dataset |
|---|---|---|
| FishGlobe | [fish.openglobes.com](https://fish.openglobes.com) | 35,000+ fish species |
| DinoGlobe | [dino.openglobes.com](https://dino.openglobes.com) | Dinosaur fossil sites |
| VolcanoGlobe | [volcano.openglobes.com](https://volcano.openglobes.com) | 1,400+ active volcanoes |
| QuakeGlobe | [quake.openglobes.com](https://quake.openglobes.com) | Real-time earthquakes (USGS) |
| MeteorGlobe | [meteor.openglobes.com](https://meteor.openglobes.com) | 45,000+ meteorite landings |
| ShipwreckGlobe | [wreck.openglobes.com](https://wreck.openglobes.com) | 250,000+ known wrecks |

## Install

```bash
pnpm add @openglobes/core
```

Peer dependencies (your app must also have these):

```bash
pnpm add react react-dom three
```

## Quick start

```tsx
import '@openglobes/core/tokens.css';
import {
  GlobeRoot, Globe, FilterPanel, ZoomControls,
  OCEAN_DARK_THEME, SAMPLE_POINTS, SAMPLE_ARCS, SAMPLE_TRAILS,
} from '@openglobes/core';
import { useState } from 'react';

function App() {
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  return (
    <GlobeRoot theme={OCEAN_DARK_THEME}>
      <Globe
        points={SAMPLE_POINTS}
        arcs={SAMPLE_ARCS}
        trails={SAMPLE_TRAILS}
        onPointClick={(p) => console.log('Clicked:', p.name)}
      />
      <FilterPanel values={filters} onChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))} />
      <ZoomControls onZoomIn={() => {}} onZoomOut={() => {}} />
    </GlobeRoot>
  );
}
```

## Architecture

This is a **multi-repo** setup. This repo is the shared rendering engine only.

```
openglobes-core        ← this repo (npm package)
openglobes-fish        ← imports @openglobes/core, serves fish data tiles
openglobes-dino        ← imports @openglobes/core, serves dino data tiles
...
```

Globe-specific repos provide:
- Pre-built static JSON data tiles (no backend, no runtime API calls)
- A `GlobeTheme` object that configures filters, colors, detail fields
- CSS overrides for `--og-bg-void` and `--og-accent`

Core provides:
- 3D globe rendering (Three.js + three-globe)
- All UI components (filter panel, detail drawer, search, zoom, mobile sheet)
- Spatial tile loading by viewport
- Responsive layout (mobile bottom sheets, desktop sidebars)
- The glassmorphism design system

### File structure

```
src/
├── Globe.tsx              # Public wrapper — React.lazy loads GlobeScene
├── GlobeScene.tsx         # Three.js scene (code-split chunk)
├── GlobeRoot.tsx          # Theme provider + CSS variable scope
├── layers/
│   ├── ArcLayer.ts        # Point-to-point arcs with traveling glow particles
│   └── TrailLayer.ts      # Multi-waypoint trails with directional flow
├── ui/
│   ├── FilterPanel.tsx    # Glass sidebar (desktop) / bottom sheet (mobile)
│   ├── DetailDrawer.tsx   # Item detail panel — metadata grid, link pills
│   ├── SearchBar.tsx      # Glass input with dropdown results
│   ├── MobileSheet.tsx    # Draggable bottom sheet with velocity-based snap
│   ├── LoadingOrb.tsx     # SVG wireframe sphere animation
│   └── ZoomControls.tsx   # Stacked glass [+][−] buttons
├── hooks/
│   ├── useSpatialIndex.ts # Fetch JSON tiles by viewport bounds + zoom
│   └── useResponsive.ts   # Mobile / tablet / desktop breakpoints
├── theme/
│   ├── GlobeTheme.ts      # Theme type definitions
│   └── tokens.css         # CSS variables + all .og-* component classes
├── utils/
│   └── tileIndex.ts       # Slippy-map tile coordinate math
├── sampleData.ts          # 50 sample points + 5 arcs + 3 trails + ocean-dark theme
└── index.ts               # Public API (38 exports)
```

## Components

### `<GlobeRoot>`

Theme provider. Wraps your globe UI and scopes CSS variables via `data-og-theme`.

```tsx
<GlobeRoot theme={myTheme}>
  {/* All @openglobes/core components go here */}
</GlobeRoot>
```

All child components automatically receive the theme via React context — no prop drilling.

### `<Globe>`

The 3D globe. Lazy-loads the Three.js scene behind a `<Suspense>` boundary with a wireframe loading animation. Accepts points, arcs, and trails as data layers.

```tsx
<Globe
  points={points}
  arcs={arcs}
  arcConfig={{ particleSpeed: 3000 }}
  trails={trails}
  onPointClick={(point) => setSelected(point)}
  onArcClick={(label) => console.log(label)}
  onCameraChange={(distance) => spatialIndex.updateCamera(distance, bounds)}
  onSceneReady={(refs) => {
    // refs.scene, refs.camera, refs.renderer, refs.globe, refs.getCoords
  }}
  onFrame={(dt) => {
    // Called every animation frame — use for custom layer updates
  }}
/>
```

| Prop | Type | Description |
|---|---|---|
| `points` | `PointItem[]` | Data points rendered on the globe surface |
| `arcs` | `ArcDatum[]` | Point-to-point arcs with gradient + glow particle |
| `arcConfig` | `ArcLayerConfig` | Layer-wide arc defaults |
| `trails` | `TrailDatum[]` | Multi-waypoint trails with directional flow |
| `trailConfig` | `TrailLayerConfig` | Layer-wide trail defaults |
| `onPointClick` | `(point) => void` | Fires when a point marker is clicked |
| `onArcClick` | `(label) => void` | Fires when near an arc endpoint/midpoint |
| `onCameraChange` | `(distance) => void` | Fires every frame with camera distance |
| `onSceneReady` | `(refs) => void` | Fires once with scene/camera/globe refs for custom layers |
| `onFrame` | `(dt) => void` | Fires every frame with delta time in seconds |
| `theme` | `GlobeTheme` | Optional — overrides context from `<GlobeRoot>` |

### `<FilterPanel>`

Renders filter controls from `theme.filters` config. Desktop: glass sidebar (320px, left edge). Mobile: wraps in `<MobileSheet>`.

```tsx
<FilterPanel
  values={filterValues}
  onChange={(key, value) => setFilterValues(prev => ({ ...prev, [key]: value }))}
  resultCount={4677}
  onClose={() => setShowFilters(false)}
  // Mobile bottom sheet control:
  sheetSnap="peek"
  onSheetSnapChange={setSheetSnap}
/>
```

Supports three filter types configured via `theme.filters`:

| Type | Renders | Value type |
|---|---|---|
| `chips` | Multi-select tag buttons | `string[]` |
| `range` | Custom-styled slider with accent track | `number` |
| `toggle` | On/off switch | `boolean` |

### `<DetailDrawer>`

Shows details for a selected item. Desktop: glass sidebar (400px, right edge, slide-in animation). Mobile: full bottom sheet.

```tsx
<DetailDrawer
  data={{
    id: '1',
    name: 'Common Carp',
    nameZh: '鲤鱼',
    scientificName: 'Cyprinus carpio',
    description: 'A widespread freshwater fish...',
    metadata: { maxLength: '120 cm', habitat: 'Freshwater' },
    images: ['/img/carp.webp'],
    links: [{ label: 'FishBase', url: 'https://fishbase.org/summary/1' }],
    attribution: 'FishBase (CC-BY-NC)',
  }}
  onClose={() => setSelected(null)}
/>
```

### `<SearchBar>`

Glass input with heavy backdrop blur. Dropdown shows up to 6 results with name, secondary text, and rarity color dot. Full keyboard navigation (arrow keys, Enter, Escape).

```tsx
<SearchBar
  onSearch={(query) => fuse.search(query).map(r => r.item)}
  onSelect={(item) => flyToPoint(item)}
  placeholder="Search species…"
/>
```

### `<MobileSheet>`

Draggable bottom sheet with three snap points and velocity-based snapping.

| Snap | Height | Use case |
|---|---|---|
| `closed` | 48px (handle only) | Collapsed, minimal footprint |
| `peek` | 50vh | Preview, filter summary |
| `expanded` | 85vh | Full content, scrollable |

Fast swipe up/down (>0.5 px/ms) snaps directionally. Slow drags snap to nearest position. Escape key closes from expanded to peek.

```tsx
<MobileSheet snap={snap} onSnapChange={setSnap} title="Filters">
  {children}
</MobileSheet>
```

### `<ZoomControls>`

Two stacked glass buttons (44px touch targets) positioned bottom-right.

```tsx
<ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
```

### `<LoadingOrb>`

SVG wireframe sphere with rotating + pulsing glow animation. Shown automatically as the `<Suspense>` fallback while the Three.js chunk loads. Can also be used standalone.

## Data Layers

### ArcLayer — point-to-point connections

Animated arcs between two coordinates. Each arc renders two elements: a visible body arc and a traveling glow particle.

```tsx
<Globe arcs={[
  {
    startLat: 36.5, startLng: -122.0,
    endLat: 20.8, endLng: -156.5,
    color: ['#f9c74f', '#ef476f'],  // start → end gradient
    width: 1.2,
    elevation: 0.3,                 // height above surface (null = auto)
    particle: true,                 // glowing dot traveling along arc
    particleColor: 'rgba(255,255,255,0.9)',
    particleSpeed: 2000,            // ms for one traversal
  },
]} />
```

| ArcDatum field | Type | Default | Description |
|---|---|---|---|
| `startLat/Lng` | `number` | required | Start coordinate |
| `endLat/Lng` | `number` | required | End coordinate |
| `color` | `string \| [string, string]` | accent gradient | Single or gradient |
| `label` | `string` | — | Used by `onArcClick` |
| `width` | `number` | `0.8` | Stroke width |
| `elevation` | `number \| null` | `null` (auto) | Height above surface |
| `dashLength` | `number` | `0` (solid) | Dash segment length |
| `dashGap` | `number` | `0` | Gap between dashes |
| `speed` | `number` | `0` (static) | Dash animation cycle (ms) |
| `particle` | `boolean` | `true` | Show traveling glow dot |
| `particleColor` | `string` | white | Glow dot color |
| `particleSpeed` | `number` | `2000` | Glow dot traversal time (ms) |

### TrailLayer — multi-waypoint directional flow

Animated dashed lines between connected waypoints. Dashes move along the path to show direction ("ants marching" effect). Use for ocean currents, migration routes, shipping lanes.

```tsx
<Globe trails={[
  {
    waypoints: [
      { lat: 24.5, lng: -80.0 },
      { lat: 35.0, lng: -74.0 },
      { lat: 50.0, lng: -40.0 },
      { lat: 52.0, lng: -20.0 },
    ],
    color: ['#4cc9f0', '#56d6a0'],  // gradient along path
    width: 1.5,
    speed: 8000,                     // ms for full path traversal
    dashLength: 0.3,
    dashGap: 0.15,
  },
]} />
```

| TrailDatum field | Type | Default | Description |
|---|---|---|---|
| `waypoints` | `TrailWaypoint[]` | required | Ordered path coordinates |
| `color` | `string \| string[]` | accent gradient | Single or multi-stop gradient |
| `width` | `number` | `1.0` | Stroke width |
| `dashLength` | `number` | `0.3` | Dash segment length |
| `dashGap` | `number` | `0.15` | Gap between dashes |
| `speed` | `number` | `5000` | Animation cycle (ms). Negative = reverse |
| `altitude` | `number` | `0.005` | Height above surface |

## Hooks

### `useSpatialIndex`

Fetches JSON tile files by viewport bounds and zoom level. Debounced, cached, with optional tile manifest to prevent 404s.

```tsx
const { points, clusters, zoom, loading, isClusterZoom, updateCamera } = useSpatialIndex({
  tileBaseUrl: '/data/fish',
  minZoom: 0,
  maxZoom: 7,
  tileManifestUrl: '/data/fish/tile-manifest.json',  // optional
});
```

Call `updateCamera(distance, bounds)` from the globe's render loop. Returns merged point/cluster data for the visible tiles.

### `useResponsive`

Mobile-first breakpoint detection via `useSyncExternalStore`. SSR-safe (defaults to 375px mobile).

```tsx
const { isMobile, isTablet, isDesktop, breakpoint, width } = useResponsive();
```

| Breakpoint | Range |
|---|---|
| `mobile` | < 768px |
| `tablet` | 768–1023px |
| `desktop` | ≥ 1024px |

### `useGlobeTheme`

Access the current `GlobeTheme` from context (must be inside `<GlobeRoot>`).

```tsx
const theme = useGlobeTheme();
```

## Data Tile Contract

Globe repos serve pre-built static JSON tile files. Core fetches them by viewport.

### Point tile (`tiles/z4/3_7.json` — zoom 4+)

```json
{
  "points": [
    { "id": "1", "lat": 35.6, "lng": 139.7, "name": "Common Carp", "nameZh": "鲤鱼", "rarity": 1 }
  ]
}
```

### Cluster tile (`tiles/z0/0_0.json` — zoom 0–3)

```json
{
  "clusters": [
    { "lat": 35.6, "lng": 139.7, "count": 482, "topItems": [{ "id": "1", "name": "Carp" }] }
  ]
}
```

### Detail file (`detail/1.json` — fetched on click)

```json
{
  "id": "1",
  "name": "Common Carp",
  "nameZh": "鲤鱼",
  "scientificName": "Cyprinus carpio",
  "description": "...",
  "metadata": { "maxLength": "120 cm", "habitat": "Freshwater" },
  "images": ["thumb.webp"],
  "links": [{ "label": "FishBase", "url": "..." }],
  "attribution": "FishBase (CC-BY-NC)"
}
```

### LOD (Level of Detail)

| Zoom | Layer | Data per tile |
|---|---|---|
| 0–3 | Cluster bubbles | Aggregated counts, few KB |
| 4–7 | Individual points | Max 200 per tile |
| Click | Detail file | Full metadata, images, links |

## Theme System

The theme system has two layers that work together:

### Layer 1: CSS Variables

Import `@openglobes/core/tokens.css` once. This defines all `--og-*` custom properties and `.og-*` component classes.

Each globe theme only overrides two CSS variables:

```css
[data-og-theme="fish"]      { --og-bg-void: #050a12; --og-accent: #4cc9f0; }
[data-og-theme="dino"]      { --og-bg-void: #0d0800; --og-accent: #d4a373; }
[data-og-theme="volcano"]   { --og-bg-void: #0a0200; --og-accent: #ff6b35; }
[data-og-theme="quake"]     { --og-bg-void: #0a0005; --og-accent: #ff3355; }
[data-og-theme="meteor"]    { --og-bg-void: #050010; --og-accent: #9b72cf; }
[data-og-theme="shipwreck"] { --og-bg-void: #020a08; --og-accent: #2ec4b6; }
```

Everything else (glass panels, borders, text, glow effects) derives from these two values. All six themes are built into `tokens.css`.

### Layer 2: GlobeTheme object

The JS theme object controls behavior: which filters to render, how to color data points, what fields the detail drawer shows.

```tsx
const myTheme: GlobeTheme = {
  id: 'fish',                    // matches CSS [data-og-theme="fish"]
  name: 'FishGlobe',
  tagline: 'Every fish species, mapped',
  globeTexture: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  atmosphereColor: '#4fc3f7',
  backgroundColor: '#070d1f',
  pointColor: (item) => { /* rarity → color */ },
  pointSize: (item) => { /* rarity → radius */ },
  clusterColor: (count) => { /* count → color */ },
  colors: { primary, surface, text, textMuted, accent, gradient },
  fonts: { display, body, mono },
  filters: [
    { key: 'rarity', label: 'Conservation Status', type: 'chips', options: [...] },
    { key: 'depth', label: 'Max Depth', type: 'range', min: 0, max: 8000, unit: 'm' },
    { key: 'showRare', label: 'Rare species only', type: 'toggle' },
  ],
  detailFields: [
    { key: 'scientificName', label: 'Scientific Name' },
    { key: 'maxLength', label: 'Max Length' },
  ],
  attribution: [{ name: 'FishBase', url: 'https://fishbase.org', license: 'CC-BY-NC' }],
  externalLinks: (item) => [{ label: 'FishBase', url: `https://fishbase.org/summary/${item.id}` }],
};
```

### Switching themes at runtime

Pass a different theme to `<GlobeRoot>`. All child components update automatically.

```tsx
const [theme, setTheme] = useState(fishTheme);

<GlobeRoot theme={theme}>
  <button onClick={() => setTheme(dinoTheme)}>Switch to Dino</button>
  <Globe points={points} />
  <FilterPanel values={filters} onChange={setFilter} />
</GlobeRoot>
```

### Creating a custom theme

1. Add a CSS override: `[data-og-theme="myglobe"] { --og-bg-void: #...; --og-accent: #...; }`
2. Create a `GlobeTheme` object with `id: 'myglobe'`
3. Pass it to `<GlobeRoot theme={myTheme}>`
4. Optionally override `.og-*` classes for deeper customization

### CSS class targeting

All components use `.og-*` classes and `data-og` attributes:

```css
/* Override chip style for a specific theme */
[data-og-theme="volcano"] .og-chip[aria-pressed="true"] {
  background: rgba(255, 107, 53, 0.15);
  border-color: #ff6b35;
  color: #ff6b35;
}

/* Target specific components */
[data-og="filter-panel"] .og-sidebar-content { padding: 24px; }
[data-og="detail-drawer"] .og-drawer-name { font-size: 28px; }
```

### `data-og` identifiers

| Identifier | Component / Element |
|---|---|
| `root` | `<GlobeRoot>` wrapper |
| `filter-panel` | `<FilterPanel>` sidebar |
| `filter-content` | Filter controls area |
| `filter-close` | Close button |
| `chip` | Chip filter button |
| `range` | Range slider input |
| `toggle` | Toggle switch |
| `result-count` | Result count display |
| `detail-drawer` | `<DetailDrawer>` sidebar |
| `detail-name` | Species/item name heading |
| `detail-sci` | Scientific name |
| `detail-desc` | Description paragraph |
| `detail-metadata` | Metadata grid |
| `detail-links` | External links area |
| `detail-image` | Image container |
| `detail-attribution` | Attribution text |
| `detail-close` | Close button |
| `search-bar` | `<SearchBar>` container |
| `search-input` | Search text input |
| `search-dropdown` | Results dropdown |
| `search-result` | Individual result row |
| `mobile-sheet` | `<MobileSheet>` container |
| `sheet-handle` | Drag handle area |
| `sheet-backdrop` | Semi-transparent backdrop |
| `zoom-controls` | `<ZoomControls>` container |
| `zoom-in` | Zoom in button |
| `zoom-out` | Zoom out button |
| `loading-orb` | `<LoadingOrb>` container |
| `globe-error` | Globe load error state |

## Advanced: Custom Three.js Layers

Use `onSceneReady` to access the raw Three.js scene and add custom objects:

```tsx
<Globe
  onSceneReady={({ scene, camera, globe, getCoords }) => {
    // Add a custom mesh at a specific lat/lng
    const pos = getCoords(35.6, 139.7, 0.1);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(pos.x, pos.y, pos.z);
    scene.add(mesh);
  }}
  onFrame={(dt) => {
    // Update custom animations every frame
    customMesh.rotation.y += dt * 0.5;
  }}
/>
```

`GlobeSceneRefs` provides: `scene`, `camera`, `renderer`, `controls`, `globe`, and `getCoords(lat, lng, alt)`.

## Performance Budgets

| Metric | Budget |
|---|---|
| Initial JS (before globe) | < 150KB gzip |
| First paint | < 1.5s on 4G |
| Globe interactive | < 3s on 4G |
| Data per viewport | < 50KB |

The globe scene is code-split via `React.lazy` — the Three.js chunk only loads after the page renders.

## Responsive Layout

```
Mobile (< 768px):                    Desktop (≥ 768px):
┌─────────────────────┐              ┌──────────┬──────────────────┬───────────┐
│ [Search...........] │              │          │  [Search..]      │           │
│                     │              │ FILTER   │                  │  DETAIL   │
│    ╭───────╮        │              │ PANEL    │    ╭────────╮    │  DRAWER   │
│    │ GLOBE │        │              │ 320px    │    │ GLOBE  │    │  400px    │
│    ╰───────╯        │              │ glass    │    ╰────────╯    │  glass    │
│               [+]   │              │          │           [+][-] │           │
│               [-]   │              │          │     attribution  │           │
│ ┌─ ─ ─ ─ ─ ─ ─ ─┐  │              └──────────┴──────────────────┴───────────┘
│ │  ━━━ handle    │  │
│ │  Bottom Sheet  │  │
│ └─ ─ ─ ─ ─ ─ ─ ─┘  │
└─────────────────────┘
```

## Tech Stack

| Layer | Technology |
|---|---|
| 3D rendering | [three-globe](https://github.com/vasturiano/three-globe) (direct Three.js) |
| UI framework | React 19 + `React.lazy` for code-splitting |
| Type system | TypeScript strict mode, zero `any` |
| Design system | Glassmorphism — CSS custom properties + `.og-*` classes |
| Spatial indexing | Slippy-map tiles + `useSpatialIndex` hook |
| Responsive | `useResponsive` hook (`useSyncExternalStore`, SSR-safe) |
| Build | [tsup](https://tsup.egoist.dev/) (ESM, tree-shakeable, auto code-split) |
| Package manager | pnpm |

## Development

```bash
pnpm install
pnpm typecheck    # TypeScript strict check
pnpm build        # Production build → dist/
pnpm dev          # Watch mode
```

For local development with a globe repo:

```bash
# In this repo:
pnpm link --global

# In the globe repo (e.g., openglobes-fish):
pnpm link --global @openglobes/core
```

## License

AGPL-3.0 — see [LICENSE](LICENSE).
