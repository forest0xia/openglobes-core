# Agent: core-engine
## Last Session: 2026-03-19
## Status: IN PROGRESS
## Current Task: CSS class refactor + theme provider

## Completed:
- [x] Project scaffold (pnpm, tsconfig, tsup, three, three-globe, React 19)
- [x] src/theme/GlobeTheme.ts — full type system
- [x] src/GlobeScene.tsx — Three.js scene with ThreeGlobe + OrbitControls
- [x] src/hooks/useSpatialIndex.ts — tile fetching, debounced, cached
- [x] src/hooks/useResponsive.ts — mobile/tablet/desktop breakpoints
- [x] src/utils/tileIndex.ts — slippy-map math
- [x] src/sampleData.ts — 50 fish species + OCEAN_DARK_THEME

### CSS Class Refactor (this session):
- [x] **src/theme/tokens.css** — FULL REWRITE: CSS variables + 13 sections of .og-* component classes + 6 theme variants + 6 keyframe animations. All visual styling lives here.
- [x] **src/GlobeRoot.tsx** — NEW: theme provider + `useGlobeTheme` + `useResolvedTheme`. Wraps children in `<div data-og-theme={theme.id}>` for CSS variable scoping.
- [x] **src/Globe.tsx** — updated: uses `useResolvedTheme`, theme prop now optional
- [x] **src/ui/LoadingOrb.tsx** — REWRITTEN: className-only (og-orb-*), data-og="loading-orb"
- [x] **src/ui/ZoomControls.tsx** — REWRITTEN: className-only (og-zoom-*), :active CSS handles scale, data-og="zoom-controls"
- [x] **src/ui/MobileSheet.tsx** — REWRITTEN: className-based (og-sheet-*), dynamic height via --og-sheet-h CSS var, data-og="mobile-sheet"
- [x] **src/ui/SearchBar.tsx** — REWRITTEN: className-based (og-search-*), rarity dots via data-rarity attr, :focus-within in CSS, data-og="search-bar"
- [x] **src/ui/FilterPanel.tsx** — REWRITTEN: className-based, uses useResolvedTheme for context, og-chip with [aria-pressed], og-range with --og-range-pct, og-toggle-track with [aria-checked], data-og="filter-panel"
- [x] **src/ui/DetailDrawer.tsx** — REWRITTEN: className-based (og-drawer-*), metadata grid, link pills, uses useResolvedTheme, data-og="detail-drawer"
- [x] **README.md** — REWRITTEN: theme system docs, switching themes, CSS customization, component table with data-og identifiers
- [x] **index.ts** — 29 exports (added GlobeRoot, useGlobeTheme)
- [x] TypeScript: PASS, Build: PASS
- [x] JS bundle: 33KB (down from 48KB — inline styles removed)

## Key Architecture Decisions:
- **All visual styling in CSS classes** — components use `className="og-*"`, no inline style objects
- **`data-og` attributes** on every component root + key sub-elements for CSS targeting/testing
- **Theme switching via `<GlobeRoot>`** — sets `data-og-theme={theme.id}` on wrapper div, CSS variable cascade handles all visual updates
- **Theme prop optional** — components use `useResolvedTheme(propTheme)` which falls back to context from GlobeRoot
- **Dynamic values via CSS custom properties** — range slider progress uses `--og-range-pct`, sheet height uses `--og-sheet-h` (set as inline style, consumed by CSS class)
- **State-dependent styles via attribute selectors** — `[aria-pressed="true"]` for chips, `[aria-checked="true"]` for toggles, `[data-expanded="true"]` for backdrop, `[data-rarity="3"]` for rarity dots
- **Hover/focus via CSS pseudo-classes** — `:hover`, `:active`, `:focus-within` in the stylesheet, no JS event handlers for hover
- **6 built-in theme variants** in CSS — fish, dino, volcano, quake, meteor, shipwreck. Each overrides only --og-bg-void and --og-accent.

### ArcLayer + TrailLayer (this session):
- [x] **src/layers/ArcLayer.ts** — configures three-globe arcs layer. ArcDatum with startLat/Lng, endLat/Lng, gradient color, width, elevation, dash pattern, speed. Each arc produces 2 entries: solid body arc + traveling glow particle (tiny bright dash, 0.05 length, gap 2, animated). applyArcLayer() function takes globe + data + config.
- [x] **src/layers/TrailLayer.ts** — configures three-globe paths layer for multi-waypoint trails. TrailDatum with waypoints[], dash animation for "ants marching" directional flow. applyTrailLayer() function.
- [x] **GlobeScene.tsx** — updated: accepts arcs/arcConfig/trails/trailConfig props, applies layers via useEffect
- [x] **Globe.tsx** — updated: passes through arc/trail props to GlobeScene
- [x] **sampleData.ts** — added SAMPLE_ARCS (5 fish migration routes) + SAMPLE_TRAILS (3 ocean currents: Gulf Stream, Kuroshio, Agulhas)
- [x] **index.ts** — 38 exports total (added applyArcLayer, ArcDatum, ArcLayerConfig, applyTrailLayer, TrailDatum, TrailWaypoint, TrailLayerConfig, SAMPLE_ARCS, SAMPLE_TRAILS)
- [x] TypeScript: PASS, Build: PASS
- [x] tsup auto-extracted shared layer chunk (chunk-OORM5PHU.js)

### README (this session):
- [x] **README.md** — comprehensive rewrite: architecture overview, file structure, all 8 components with props tables, ArcLayer + TrailLayer with field tables, all 3 hooks with usage, data tile contract, LOD system, theme system (CSS vars + JS object + switching + custom themes + CSS targeting), full data-og identifier table, custom Three.js layers via onSceneReady, performance budgets, responsive layout diagrams, tech stack, development commands

## Next Steps:
- [ ] Create demo page to visually verify all components
- [ ] PointLayer.ts (standalone, currently inline in GlobeScene), HeatmapLayer.ts
- [ ] useCluster.ts (Supercluster), useLazyData.ts
- [ ] colorScale.ts, formatters.ts
- [ ] Attribution.tsx (collapsible info icon)
- [ ] ImageCard.tsx
- [ ] Theme presets as JS objects (earth-natural, space-void, warm-amber)

## Blocked On:
(nothing)
