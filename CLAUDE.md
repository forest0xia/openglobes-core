# CLAUDE.md — Instructions for AI agents working on this repo

## What is this?
@openglobes/core — a reusable React + Three.js 3D globe engine published as a public npm package.
Other repos (openglobes-fish, openglobes-dino, etc.) import this to build themed 3D data globes.
Domain: openglobes.com. Each globe lives at a subdomain (fish.openglobes.com, etc.).

## Tech stack (this library)
- three-globe (NOT react-globe.gl — direct Three.js for better perf)
- React 19 + React.lazy for code-splitting the globe chunk
- CSS custom properties for theming (tokens.css shipped with package)
- TypeScript strict mode, zero `any` types
- tsup for ESM build + declarations
- pnpm as package manager

Note: Globe repos (not this library) additionally use Astro 5, Tailwind 4, Fuse.js, etc.

## Architecture
Read docs/ARCHITECTURE.md for full details. Key points:
- This is a MULTI-REPO setup. This repo is the shared engine only.
- Globe-specific repos install this as `@openglobes/core` from npm (or `file:../openglobes-core` during local dev).
- All data is pre-built into static JSON tiles by openglobes-etl. No backend. No API calls at runtime (except QuakeGlobe's USGS live feed).
- Mobile-first: page renders static HTML first, globe lazy-loads after.
- Each globe repo deploys independently via GitHub Pages with its own custom subdomain.

## How globe repos consume this
- Install: `pnpm add @openglobes/core` (or `"file:../openglobes-core"` for local dev)
- Import components: `Globe`, `GlobeRoot`, `FilterPanel`, `DetailDrawer`, `SearchBar`, `MobileSheet`, `ZoomControls`, `LoadingOrb`
- Import hooks: `useSpatialIndex`, `useResponsive`, `useGlobeTheme`
- Import layers: `applyArcLayer`, `applyTrailLayer`
- Import utilities: `cameraDistanceToZoom`, `latLngToTile`, `tilesForViewport`
- Import theme type: `GlobeTheme` — each globe defines its own theme object
- Import CSS: `@openglobes/core/tokens.css` for the design system classes (og-glass, og-chip, etc.)
- See README.md for full API documentation

## Performance budgets
- Initial JS: < 150KB gzip (globe is code-split)
- First paint: < 1.5s on 4G
- Globe interactive: < 3s on 4G
- Data per viewport: < 50KB (spatial tiles loaded on demand)
- No full dataset ever loaded at once

## Session continuity
- Before ending ANY session, update `.agent-state/core-engine.md`
- Log: what you did, what's next, blockers, decisions made
- Next session starts by reading that file

## Code conventions
- TypeScript strict, no `any`
- All components accept a `theme` prop from GlobeTheme type
- Mobile-first responsive (375px width first)
- All images use loading="lazy"
- Passive event listeners for touch gestures
- Conventional commits: feat(globe): add point layer
