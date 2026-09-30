import { DateTime } from 'luxon'
import { describe, expect, it } from 'vitest'
import { filterMallsByStatus } from './filterMallsByStatus'

const IST = 'Asia/Kolkata'

const openMall = {
  name: 'open',
  timezone: IST,
  operatingHours: { monday: { open: '10:00', close: '22:00' } },
}
const closedMall = {
  name: 'closed',
  timezone: IST,
  operatingHours: { monday: { open: '16:00', close: '20:00' } },
}
const unknownMall = { name: 'unknown', timezone: IST, operatingHours: {} }

const malls = [openMall, closedMall, unknownMall]

const now = DateTime.fromISO('2026-09-28T15:00:00', { zone: IST })

describe('filterMallsByStatus', () => {
  it('returns every mall for "all"', () => {
    expect(filterMallsByStatus(malls, 'all', now)).toHaveLength(3)
  })

  it('returns only open malls for "open"', () => {
    expect(filterMallsByStatus(malls, 'open', now)).toEqual([openMall])
  })

  it('returns only closed malls for "closed"', () => {
    expect(filterMallsByStatus(malls, 'closed', now)).toEqual([closedMall])
  })

  it('excludes malls with unavailable hours from open and closed', () => {
    expect(filterMallsByStatus([unknownMall], 'open', now)).toEqual([])
    expect(filterMallsByStatus([unknownMall], 'closed', now)).toEqual([])
  })

  it('changes result when time changes', () => {
    const later = DateTime.fromISO('2026-09-28T17:00:00', { zone: IST })
    expect(filterMallsByStatus(malls, 'open', later)).toEqual([openMall, closedMall])
  })
})