import type { DateTime } from 'luxon'
import type { Mall } from '../types/mall'
import { getMallStatus } from './getMallStatus'

export type StatusFilter = 'all' | 'open' | 'closed'


export function filterMallsByStatus<T extends Pick<Mall, 'timezone' | 'operatingHours'>>(
  malls: T[],
  filter: StatusFilter,
  now: DateTime,
): T[] {
  if (filter === 'all') return malls
  return malls.filter((mall) => getMallStatus(mall, now).status === filter)
}