import { DateTime } from 'luxon'
import { describe, expect, it } from 'vitest'
import { getMallStatus } from './getMallStatus'

const IST = 'Asia/Kolkata'
const mall = {
  timezone: IST,
  operatingHours: {
    monday: { open: '10:00', close: '22:00' },
    tuesday: { open: '12:00', close: '20:00' }, 
    wednesday: null, 
  },
}

const at = (iso: string, zone = IST) => DateTime.fromISO(iso, { zone })

describe('getMallStatus', () => {
  it('is closed before opening', () => {
    const r = getMallStatus(mall, at('2026-09-28T09:59:00'))
    expect(r.status).toBe('closed')
    expect(r.reason).toBe('before-opening')
  })

  it('is open exactly at opening time', () => {
    expect(getMallStatus(mall, at('2026-09-28T10:00:00')).status).toBe('open')
  })

  it('is open during opening hours', () => {
    const r = getMallStatus(mall, at('2026-09-28T15:30:00'))
    expect(r.status).toBe('open')
    expect(r.todayHours).toEqual({ open: '10:00', close: '22:00' })
  })

  it('is open one second before closing', () => {
    expect(getMallStatus(mall, at('2026-09-28T21:59:59')).status).toBe('open')
  })

  it('is closed exactly at closing time', () => {
    const r = getMallStatus(mall, at('2026-09-28T22:00:00'))
    expect(r.status).toBe('closed')
    expect(r.reason).toBe('after-closing')
  })

  it('is closed after closing', () => {
    expect(getMallStatus(mall, at('2026-09-28T23:30:00')).status).toBe('closed')
  })

  it('uses the mall timezone, not the viewer timezone', () => {
    const instant = DateTime.fromISO('2026-09-28T04:30:00Z')
    expect(getMallStatus(mall, instant).status).toBe('open')

    const newYorkMall = { ...mall, timezone: 'America/New_York' }
    expect(getMallStatus(newYorkMall, instant).status).toBe('closed')
  })

  it("uses the mall's local day, not the viewer's day", () => {
    const instant = DateTime.fromISO('2026-09-28T20:00:00Z')
    const r = getMallStatus(mall, instant)
    expect(r.reason).toBe('before-opening')
    expect(r.todayHours).toEqual({ open: '12:00', close: '20:00' })
  })

  it('is closed when today is explicitly null', () => {
    const r = getMallStatus(mall, at('2026-09-30T12:00:00')) 
    expect(r.status).toBe('closed')
    expect(r.reason).toBe('closed-today')
  })

  it('is unavailable when today has no hours', () => {
    const r = getMallStatus(mall, at('2026-10-01T12:00:00')) 
    expect(r.status).toBe('unavailable')
    expect(r.reason).toBe('missing-hours')
  })

  it('is unavailable when operatingHours is empty', () => {
    const r = getMallStatus({ timezone: IST, operatingHours: {} }, at('2026-09-28T12:00:00'))
    expect(r.reason).toBe('missing-hours')
  })

  it('is unavailable for malformed times', () => {
    const bad = { timezone: IST, operatingHours: { monday: { open: '10am', close: '22:00' } } }
    expect(getMallStatus(bad, at('2026-09-28T12:00:00')).reason).toBe('invalid-hours')
  })

  it('is unavailable when open equals close', () => {
    const bad = { timezone: IST, operatingHours: { monday: { open: '10:00', close: '10:00' } } }
    expect(getMallStatus(bad, at('2026-09-28T10:00:00')).reason).toBe('invalid-hours')
  })

  it('is unavailable for an invalid timezone', () => {
    const bad = { ...mall, timezone: 'Not/AZone' }
    expect(getMallStatus(bad, at('2026-09-28T12:00:00')).reason).toBe('invalid-timezone')
  })
})

describe('getMallStatus with midnight-crossing hours', () => {
  const night = {
    timezone: IST,
    operatingHours: {
      sunday: { open: '18:00', close: '02:00' },
      monday: { open: '18:00', close: '02:00' },
      tuesday: { open: '10:00', close: '22:00' },
    },
  }

  it('is open late in the evening on the opening day', () => {
    expect(getMallStatus(night, at('2026-09-28T23:00:00')).status).toBe('open')
  })

  it('is open exactly at the opening time', () => {
    expect(getMallStatus(night, at('2026-09-28T18:00:00')).status).toBe('open')
  })

  it("is still open after midnight, using the previous day's hours", () => {
    const r = getMallStatus(night, at('2026-09-29T01:00:00')) // Tuesday 01:00
    expect(r.status).toBe('open')
    expect(r.todayHours).toEqual({ open: '18:00', close: '02:00' })
  })

  it('is closed exactly at the closing time after midnight', () => {
    // Tuesday 02:00: carry-over ended, Tuesday opens at 10:00
    const r = getMallStatus(night, at('2026-09-29T02:00:00'))
    expect(r.status).toBe('closed')
    expect(r.reason).toBe('before-opening')
  })

  it('is closed in the gap before the evening opening', () => {
    const r = getMallStatus(night, at('2026-09-28T17:59:00'))
    expect(r.status).toBe('closed')
    expect(r.reason).toBe('before-opening')
  })

  it('carries over from Sunday into Monday (week wrap)', () => {
    expect(getMallStatus(night, at('2026-09-28T01:00:00')).status).toBe('open')
  })

  it('carries over even when the next day is closed all day', () => {
    const closedNext = {
      timezone: IST,
      operatingHours: {
        monday: { open: '18:00', close: '02:00' },
        tuesday: null,
      },
    }
    expect(getMallStatus(closedNext, at('2026-09-29T01:00:00')).status).toBe('open')
    expect(getMallStatus(closedNext, at('2026-09-29T03:00:00')).reason).toBe('closed-today')
  })

  it("ignores malformed hours for the previous day", () => {
    const messy = {
      timezone: IST,
      operatingHours: {
        sunday: { open: 'bad', close: '02:00' },
        monday: { open: '10:00', close: '22:00' },
      },
    }
    const r = getMallStatus(messy, at('2026-09-28T01:00:00'))
    expect(r.status).toBe('closed')
    expect(r.reason).toBe('before-opening')
  })
})