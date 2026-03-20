import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointItem, ClusterItem } from '../theme/GlobeTheme';
import {
  cameraDistanceToZoom,
  tilesForViewport,
  tileFilename,
  type ViewportBounds,
} from '../utils/tileIndex';

// ---------------------------------------------------------------------------
// useSpatialIndex — fetches the right JSON tile files based on where the
// camera is looking and how zoomed in it is.
// ---------------------------------------------------------------------------

/** Zoom threshold: at or below this level, show clusters instead of points. */
const CLUSTER_ZOOM_MAX = 3;

interface TileData {
  points?: PointItem[];
  clusters?: ClusterItem[];
}

interface SpatialIndexState {
  points: PointItem[];
  clusters: ClusterItem[];
  zoom: number;
  loading: boolean;
}

interface UseSpatialIndexOptions {
  /** Base URL where tile files are served (e.g. "/data"). */
  tileBaseUrl: string;
  /** Min tile zoom level. */
  minZoom?: number;
  /** Max tile zoom level. */
  maxZoom?: number;
  /** Active filter values — used to invalidate when filters change. */
  filters?: Record<string, unknown>;
  /** URL to tile-manifest.json — if provided, tiles not in the manifest are skipped (no 404s). */
  tileManifestUrl?: string;
}

/** Tile manifest: { "0": ["0_0"], "1": ["0_0","0_1",...], ... } */
type TileManifest = Record<string, string[]>;

/**
 * Hook that manages tile fetching based on camera state.
 *
 * Call `updateCamera(distance, bounds)` from the render loop whenever the
 * camera moves. The hook debounces fetches and caches tile responses.
 */
export function useSpatialIndex(options: UseSpatialIndexOptions) {
  const {
    tileBaseUrl,
    minZoom = 0,
    maxZoom = 7,
    tileManifestUrl,
  } = options;

  const [state, setState] = useState<SpatialIndexState>({
    points: [],
    clusters: [],
    zoom: 0,
    loading: false,
  });

  // Tile cache: key = tile filename, value = parsed JSON (null = known missing)
  const cache = useRef<Map<string, TileData | null>>(new Map());

  // Tile manifest: set of existing tile keys like "0_0" per zoom level
  const manifestRef = useRef<TileManifest | null>(null);
  const manifestLoadedRef = useRef(false);

  // Load manifest once
  useEffect(() => {
    if (!tileManifestUrl || manifestLoadedRef.current) return;
    manifestLoadedRef.current = true;
    fetch(tileManifestUrl)
      .then((r) => r.json())
      .then((data: TileManifest) => {
        manifestRef.current = data;
      })
      .catch(() => {
        // No manifest — fall back to fetching everything
      });
  }, [tileManifestUrl]);

  // Debounce timer ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track the last fetched config to avoid redundant work
  const lastFetchKey = useRef<string>('');

  const fetchTiles = useCallback(
    async (zoom: number, bounds: ViewportBounds) => {
      let tiles = tilesForViewport(bounds, zoom);

      // Filter out tiles not in the manifest (prevents 404s)
      const manifest = manifestRef.current;
      if (manifest) {
        const zoomTiles = manifest[String(zoom)];
        if (zoomTiles) {
          const tileSet = new Set(zoomTiles);
          tiles = tiles.filter((t) => tileSet.has(`${t.x}_${t.y}`));
        } else {
          // No tiles at this zoom level
          tiles = [];
        }
      }

      const fetchKey = tiles.map((t) => `${t.z}/${t.x}_${t.y}`).join(',');

      if (fetchKey === lastFetchKey.current) return;
      lastFetchKey.current = fetchKey;

      setState((prev) => ({ ...prev, loading: true }));

      const results: TileData[] = [];

      await Promise.all(
        tiles.map(async (coord) => {
          const filename = tileFilename(coord);

          // Check cache (null = known 404, skip without fetching)
          if (cache.current.has(filename)) {
            const cached = cache.current.get(filename);
            if (cached) results.push(cached);
            return;
          }

          try {
            const url = `${tileBaseUrl}/${filename}`;
            const resp = await fetch(url);
            if (!resp.ok) {
              cache.current.set(filename, null);
              return;
            }
            const data = (await resp.json()) as TileData;
            cache.current.set(filename, data);
            results.push(data);
          } catch {
            cache.current.set(filename, null);
          }
        }),
      );

      // Merge all tile data
      const allPoints: PointItem[] = [];
      const allClusters: ClusterItem[] = [];

      for (const tile of results) {
        if (tile.points) allPoints.push(...tile.points);
        if (tile.clusters) allClusters.push(...tile.clusters);
      }

      setState({
        points: allPoints,
        clusters: allClusters,
        zoom,
        loading: false,
      });
    },
    [tileBaseUrl],
  );

  /**
   * Called from the render loop when camera moves.
   * Debounces to avoid fetching on every frame.
   */
  const updateCamera = useCallback(
    (cameraDistance: number, bounds: ViewportBounds) => {
      const zoom = cameraDistanceToZoom(cameraDistance, minZoom, maxZoom);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        void fetchTiles(zoom, bounds);
      }, 150);
    },
    [fetchTiles, minZoom, maxZoom],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const isClusterZoom = state.zoom <= CLUSTER_ZOOM_MAX;

  return {
    ...state,
    isClusterZoom,
    updateCamera,
  };
}
