
import type { ImageSourcePropType } from 'react-native'

const POOL: ImageSourcePropType[] = [
  require('../../assets/malls/pool/mall-1.jpg'),
    require('../../assets/malls/pool/mall-2.jpg'),
  require('../../assets/malls/pool/mall-3.jpg'),
  require('../../assets/malls/pool/mall-4.jpg'),
  require('../../assets/malls/pool/mall-5.jpg'),
  require('../../assets/malls/pool/mall-6.jpg'),
  require('../../assets/malls/pool/mall-7.jpg'),
  require('../../assets/malls/pool/mall-8.jpg'),
  require('../../assets/malls/pool/mall-9.jpg'),
  require('../../assets/malls/pool/mall-10.jpg'),

]

function hash(seed: string): number {
  let h = 0

  for (const char of seed) {
    h = (h * 31 + char.charCodeAt(0)) >>> 0
  }

  return h
}

export function getPoolImages(
  seed: string
): ImageSourcePropType[] {
  if (POOL.length === 0) return []

  const start = hash(seed) % POOL.length

  return [
    ...POOL.slice(start),
    ...POOL.slice(0, start),
  ]
}
