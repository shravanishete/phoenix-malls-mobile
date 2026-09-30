import type { Mall } from '../types/mall'

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface NearestMall<T> {
  mall: T
  distanceKm: number
}

const EARTH_RADIUS_KM = 6371

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

export function distanceKm(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.latitude - a.latitude)
  const dLng = toRadians(b.longitude - a.longitude)

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.latitude)) *
      Math.cos(toRadians(b.latitude)) *
      Math.sin(dLng / 2) ** 2

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}


export function findNearestMall<T extends Pick<Mall, 'latitude' | 'longitude'>>(
  malls: T[],
  from: Coordinates,
): NearestMall<T> | null {
  let nearest: NearestMall<T> | null = null

  for (const mall of malls) {
    const distance = distanceKm(from, mall)
    if (!Number.isFinite(distance)) continue
    if (nearest === null || distance < nearest.distanceKm) {
      nearest = { mall, distanceKm: distance }
    }
  }

  return nearest
}