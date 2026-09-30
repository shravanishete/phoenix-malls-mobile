export const WORLD_CENTER: [number, number] = [0, 20]
export const WORLD_ZOOM = 1.5

export const MIN_ZOOM = 1
export const MAX_ZOOM = 18

export const OSM_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 19,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster' as const, source: 'osm' }],
}
export const WORLD_BOUNDS: [number, number, number, number] = [-180, -85, 180, 85]