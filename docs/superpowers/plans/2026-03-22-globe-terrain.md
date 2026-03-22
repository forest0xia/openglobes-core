# Globe Terrain System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add terrain rendering (bump maps, specular maps, optional vertex displacement) to the globe engine so each globe repo can configure realistic, exaggerated terrain via its theme.

**Architecture:** Extend `GlobeTheme` with an optional `TerrainConfig` interface. In `GlobeScene`, apply terrain textures to three-globe's material after construction. No shader replacement — stays within three-globe's `MeshPhongMaterial` system.

**Tech Stack:** three-globe (`.bumpImageUrl()`, `.globeMaterial()`, `.globeCurvatureResolution()`), Three.js (`TextureLoader`, `Color`)

**Spec:** `docs/superpowers/specs/2026-03-22-globe-terrain-design.md`

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/theme/GlobeTheme.ts` | Modify | Add `TerrainConfig` interface, add `terrain?` to `GlobeTheme` |
| `src/GlobeScene.tsx` | Modify | Apply terrain settings during globe initialization |
| `src/index.ts` | Modify | Export `TerrainConfig` type |
| `src/sampleData.ts` | Modify | Add terrain config to `OCEAN_DARK_THEME` |

---

### Task 1: Add TerrainConfig type to GlobeTheme

**Files:**
- Modify: `src/theme/GlobeTheme.ts:57-95`

- [ ] **Step 1: Add `TerrainConfig` interface before `GlobeTheme`**

Add this after line 55 (after `ExternalLink` interface), before the `GlobeTheme` interface:

```typescript
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
```

- [ ] **Step 2: Add `terrain` property to `GlobeTheme` interface**

Add after the `backgroundColor` line (line 66) inside the `GlobeTheme` interface:

```typescript
  /** Optional terrain rendering (bump, specular, displacement maps). */
  terrain?: TerrainConfig;
```

- [ ] **Step 3: Verify typecheck passes**

Run: `pnpm typecheck`
Expected: No errors (terrain is optional, existing code unaffected)

- [ ] **Step 4: Commit**

```bash
git add src/theme/GlobeTheme.ts
git commit -m "feat(theme): add TerrainConfig interface to GlobeTheme"
```

---

### Task 2: Export TerrainConfig from public API

**Files:**
- Modify: `src/index.ts:14-22`

- [ ] **Step 1: Add `TerrainConfig` to the theme types export block**

In `src/index.ts`, add `TerrainConfig` to the existing type export from `./theme/GlobeTheme`:

```typescript
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
```

- [ ] **Step 2: Verify typecheck passes**

Run: `pnpm typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat(core): export TerrainConfig type from public API"
```

---

### Task 3: Apply terrain settings in GlobeScene

**Files:**
- Modify: `src/GlobeScene.tsx:1-11` (imports), `src/GlobeScene.tsx:126-133` (globe init)

- [ ] **Step 1: Add Three.js imports**

In `src/GlobeScene.tsx`, add `TextureLoader`, `Color`, and `MeshPhongMaterial` to the existing Three.js import block (line 2-10):

```typescript
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
  Vector2,
  Raycaster,
  TextureLoader,
  Color,
  MeshPhongMaterial,
} from 'three';
```

- [ ] **Step 2: Add terrain application logic after globe construction**

After `globeRef.current = globe;` (line 133) and before the OrbitControls section (line 135), insert the terrain setup block:

```typescript
    // Terrain: bump, specular, and displacement maps
    const terrain = theme.terrain;
    if (terrain) {
      if (terrain.bumpMap) {
        globe.bumpImageUrl(terrain.bumpMap);
      }

      // Increase polygon count when displacement is enabled
      if (terrain.displacementScale && terrain.displacementScale > 0) {
        globe.globeCurvatureResolution(terrain.curvatureResolution ?? 1);
      } else if (terrain.curvatureResolution) {
        globe.globeCurvatureResolution(terrain.curvatureResolution);
      }

      // Enhance globe material with terrain textures
      // three-globe types return base Material, but runtime is MeshPhongMaterial
      const globeMaterial = globe.globeMaterial() as MeshPhongMaterial;
      globeMaterial.bumpScale = terrain.bumpScale ?? 10;

      const textureLoader = new TextureLoader();
      const onTexError = (url: string) => (err: unknown) => {
        console.warn(`[openglobes] Failed to load terrain texture: ${url}`, err);
      };

      if (terrain.specularMap) {
        textureLoader.load(terrain.specularMap, (texture) => {
          globeMaterial.specularMap = texture;
          globeMaterial.specular = new Color(terrain.specular ?? 'grey');
          globeMaterial.shininess = terrain.shininess ?? 15;
          globeMaterial.needsUpdate = true;
        }, undefined, onTexError(terrain.specularMap));
      }

      if (terrain.displacementMap && terrain.displacementScale && terrain.displacementScale > 0) {
        textureLoader.load(terrain.displacementMap, (texture) => {
          globeMaterial.displacementMap = texture;
          globeMaterial.displacementScale = terrain.displacementScale!;
          globeMaterial.needsUpdate = true;
        }, undefined, onTexError(terrain.displacementMap));
      }
    }
```

- [ ] **Step 3: Verify typecheck passes**

Run: `pnpm typecheck`
Expected: No errors. The `globe.globeMaterial()` is cast to `MeshPhongMaterial` which supports `bumpScale`, `specularMap`, `specular`, `shininess`, `displacementMap`, `displacementScale`.

- [ ] **Step 4: Verify build succeeds**

Run: `pnpm build`
Expected: Clean build, no errors

- [ ] **Step 5: Commit**

```bash
git add src/GlobeScene.tsx
git commit -m "feat(globe): apply terrain bump, specular, and displacement maps"
```

---

### Task 4: Add terrain config to sample theme

**Files:**
- Modify: `src/sampleData.ts:197-199`

- [ ] **Step 1: Add terrain to OCEAN_DARK_THEME**

In `src/sampleData.ts`, add the `terrain` property after `backgroundColor` (line 199) and before `pointColor` (line 201):

```typescript
  terrain: {
    bumpMap: '//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png',
    bumpScale: 10,
    specularMap: '//cdn.jsdelivr.net/npm/three-globe/example/img/earth-water.png',
    specular: 'grey',
    shininess: 15,
  },
```

These are the same textures used in three-globe's own custom-material example. No displacement is enabled in the sample (conservative default).

- [ ] **Step 2: Verify typecheck passes**

Run: `pnpm typecheck`
Expected: No errors

- [ ] **Step 3: Verify build succeeds**

Run: `pnpm build`
Expected: Clean build

- [ ] **Step 4: Commit**

```bash
git add src/sampleData.ts
git commit -m "feat(sample): add terrain config to OCEAN_DARK_THEME"
```

---

### Task 5: Final verification

- [ ] **Step 1: Full typecheck**

Run: `pnpm typecheck`
Expected: No errors

- [ ] **Step 2: Full build**

Run: `pnpm build`
Expected: Clean build, dist/ output contains updated declarations with `TerrainConfig`

- [ ] **Step 3: Verify TerrainConfig is in declarations**

Run: `grep -l "TerrainConfig" dist/*.d.ts`
Expected: At least one declaration file contains the exported type

- [ ] **Step 4: Verify backwards compatibility**

Confirm: A `GlobeTheme` without `terrain` still typechecks (it's optional). The sample theme in `sampleData.ts` with `terrain` also typechecks.
