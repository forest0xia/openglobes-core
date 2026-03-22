# Globe Terrain System Design

**Date:** 2026-03-22
**Status:** Approved
**Goal:** Add realistic, exaggerated terrain rendering to the globe — bumpy mountains, shiny oceans, visible relief — instead of a flat textured sphere.

## Context

The current globe is a smooth sphere with a color texture applied via `three-globe`'s `.globeImageUrl()`. There is no terrain relief, surface material variation, or geometric deformation. The user wants a stylized globe where mountain ranges are visually exaggerated (3-5x real scale) for dramatic effect.

Three-globe already supports:
- `.bumpImageUrl(url)` — native bump map
- `.globeMaterial()` — get/set the globe's `MeshPhongMaterial`
- `.globeCurvatureResolution(degrees)` — control sphere polygon density

## Design

### TerrainConfig Type

Add to `GlobeTheme.ts`:

```typescript
export interface TerrainConfig {
  bumpMap?: string;
  bumpScale?: number;
  specularMap?: string;
  specular?: string;
  shininess?: number;
  displacementMap?: string;
  displacementScale?: number;
  curvatureResolution?: number;
}
```

Add to `GlobeTheme` interface:

```typescript
terrain?: TerrainConfig;
```

All fields optional. Omitting `terrain` preserves current behavior (smooth sphere).

### Field Definitions

| Field | Type | Default | Purpose |
|---|---|---|---|
| `bumpMap` | `string` | — | URL to equirectangular height grayscale texture. White = high elevation, black = low. |
| `bumpScale` | `number` | `10` | Intensity of the bump lighting effect. Higher = more pronounced terrain shadows. |
| `specularMap` | `string` | — | URL to specular map. White areas (oceans) appear shiny, black areas (land) appear rough. |
| `specular` | `string` | `'grey'` | Color of specular highlights. |
| `shininess` | `number` | `15` | Sharpness of specular highlights. Higher = tighter, more mirror-like reflections. |
| `displacementMap` | `string` | — | URL to displacement texture. Actually deforms geometry along vertex normals. Often same image as bumpMap. |
| `displacementScale` | `number` | `0` | Vertex displacement amount. `0` = disabled (bump-only). Values like `3`-`5` give stylized exaggeration. |
| `curvatureResolution` | `number` | auto | Globe polygon density in degrees. Auto-set to `1` when displacement > 0 (for ~64k vertices). Manually overridable. |

### GlobeScene Modifications

After globe construction in `GlobeScene.tsx`:

**Step 1 — Bump map** (if `terrain.bumpMap` provided):
```typescript
globe.bumpImageUrl(terrain.bumpMap);
```

**Step 2 — Curvature resolution** (if displacement enabled):
```typescript
if (terrain.displacementScale && terrain.displacementScale > 0) {
  globe.globeCurvatureResolution(terrain.curvatureResolution ?? 1);
} else if (terrain.curvatureResolution) {
  globe.globeCurvatureResolution(terrain.curvatureResolution);
}
```

**Step 3 — Material enhancement** (via `globe.globeMaterial()`):
```typescript
const globeMaterial = globe.globeMaterial();
globeMaterial.bumpScale = terrain.bumpScale ?? 10;

if (terrain.specularMap) {
  new TextureLoader().load(terrain.specularMap, (texture) => {
    globeMaterial.specularMap = texture;
    globeMaterial.specular = new Color(terrain.specular ?? 'grey');
    globeMaterial.shininess = terrain.shininess ?? 15;
  });
}

if (terrain.displacementMap && terrain.displacementScale && terrain.displacementScale > 0) {
  new TextureLoader().load(terrain.displacementMap, (texture) => {
    globeMaterial.displacementMap = texture;
    globeMaterial.displacementScale = terrain.displacementScale!;
  });
}
```

### New Three.js Imports

Add to `GlobeScene.tsx`:
```typescript
import { TextureLoader, Color } from 'three';
```

### Exports

Add to `index.ts`:
```typescript
export type { TerrainConfig } from './theme/GlobeTheme';
```

### Sample Data Update

Update `OCEAN_DARK_THEME` in `sampleData.ts` to demonstrate terrain:

```typescript
terrain: {
  bumpMap: '//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png',
  bumpScale: 10,
  specularMap: '//cdn.jsdelivr.net/npm/three-globe/example/img/earth-water.png',
  specular: 'grey',
  shininess: 15,
},
```

## Scope Boundaries

**Included:**
- `TerrainConfig` type in `GlobeTheme.ts`
- Terrain application logic in `GlobeScene.tsx`
- `TerrainConfig` export from `index.ts`
- Sample theme updated with terrain textures

**Not included:**
- No bundled texture files — globe repos provide URLs
- No LOD quadtree tile system — future enhancement for zoom-to-terrain
- No custom vertex/fragment shaders — stays within three-globe's material system
- No MeshStandardMaterial replacement — preserves three-globe internals
- No atmosphere or cloud layer changes

## Performance

- **Bump + specular only (no displacement):** Zero performance impact. Texture lookups in the existing fragment shader.
- **With displacement (`curvatureResolution: 1`):** ~64k vertices vs ~4k default. Fine for desktop. For low-end mobile, set `curvatureResolution: 2` (~16k vertices).
- **Texture loading:** Async via `TextureLoader`. Globe renders immediately with smooth surface; terrain appears once textures load. No blocking.

## Data Sources

Recommended texture sources for globe repos:
- **NASA Visible Earth** (earthobservatory.nasa.gov) — 8K/16K color + bump + specular
- **Natural Earth** — vector and raster data
- **GEBCO** — high-precision bathymetry + land elevation
- **Three-globe CDN** — ships with `earth-topology.png` (bump) and `earth-water.png` (specular)
