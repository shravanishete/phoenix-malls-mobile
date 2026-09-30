import { describe, expect, it } from 'vitest'
import { distanceKm, findNearestMall } from './findNearestMall'

const pune = { latitude: 18.5204, longitude: 73.8567 }
const mumbai = { latitude: 19.076, longitude: 72.8777 }

const malls = [
  { id: 'pune-mall', latitude: 18.562, longitude: 73.9166 },
  { id: 'mumbai-mall', latitude: 19.0866, longitude: 72.8892 },
  { id: 'tokyo-mall', latitude: 35.6762, longitude: 139.6503 },
]

describe('distanceKm', () => {
  it('is zero for the same point', () => {
    expect(distanceKm(pune, pune)).toBeCloseTo(0, 5)
  })

  it('gives a realistic Pune to Mumbai distance (about 120 km)', () => {
    const km = distanceKm(pune, mumbai)
    expect(km).toBeGreaterThan(115)
    expect(km).toBeLessThan(125)
  })

  it('is the same in both directions', () => {
    expect(distanceKm(pune, mumbai)).toBeCloseTo(distanceKm(mumbai, pune), 8)
  })
})

describe('findNearestMall', () => {
  it('picks the closest mall', () => {
    const result = findNearestMall(malls, pune)
    expect(result?.mall.id).toBe('pune-mall')
    expect(result?.distanceKm).toBeLessThan(10)
  })

  it('works across countries', () => {
    const inTokyo = { latitude: 35.68, longitude: 139.69 }
    expect(findNearestMall(malls, inTokyo)?.mall.id).toBe('tokyo-mall')
  })

  it('returns null when there are no malls', () => {
    expect(findNearestMall([], pune)).toBeNull()
  })

  it('skips malls with invalid coordinates', () => {
    const withBad = [{ id: 'bad', latitude: NaN, longitude: NaN }, ...malls]
    expect(findNearestMall(withBad, pune)?.mall.id).toBe('pune-mall')
  })
})