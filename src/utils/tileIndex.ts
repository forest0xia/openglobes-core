// ---------------------------------------------------------------------------
// tileIndex — slippy-map math to figure out which JSON tile files to fetch
// for a given camera viewport.
// ---------------------------------------------------------------------------

/** Tile coordinate. */
export interface TileCoord {
  z: number;
  x: number;
  y: number;
}

/** Viewport bounds in degrees. */
export interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Map camera distance (units from globe center) to a discrete tile zoom level.
 * three-globe globe radius is ~100 units. Camera distances typically range
 * from ~110 (zoomed in) to ~500+ (zoomed out).
 */
export function cameraDistanceToZoom(
  distance: number,
  minZoom: number,
  maxZoom: number,
): number {
  // Empirical mapping: each zoom step roughly halves the viewable area
  const FAR = 500;
  const NEAR = 120;
  const clamped = Math.max(NEAR, Math.min(FAR, distance));
  const t = 1 - (clamped - NEAR) / (FAR - NEAR); // 0 = far, 1 = near
  return Math.round(minZoom + t * (maxZoom - minZoom));
}

/** Convert lat/lng to tile x/y at a given zoom. Standard slippy-map formula. */
export function latLngToTile(lat: number, lng: number, zoom: number): TileCoord {
  const n = 2 ** zoom;
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  );
  return {
    z: zoom,
    x: Math.max(0, Math.min(n - 1, x)),
    y: Math.max(0, Math.min(n - 1, y)),
  };
}

/**
 * Given viewport bounds and zoom level, return all tile coords that intersect.
 */
export function tilesForViewport(
  bounds: ViewportBounds,
  zoom: number,
): TileCoord[] {
  const nw = latLngToTile(bounds.north, bounds.west, zoom);
  const se = latLngToTile(bounds.south, bounds.east, zoom);

  const tiles: TileCoord[] = [];
  const n = 2 ** zoom;

  // Handle wrapping around the date line
  const xStart = nw.x;
  const xEnd = se.x >= xStart ? se.x : se.x + n;

  for (let x = xStart; x <= xEnd; x++) {
    for (let y = nw.y; y <= se.y; y++) {
      tiles.push({ z: zoom, x: x % n, y });
    }
  }

  return tiles;
}

/** Build the filename for a tile: `tiles/z4/3_7.json` */
export function tileFilename(coord: TileCoord): string {
  return `tiles/z${coord.z}/${coord.x}_${coord.y}.json`;
}
