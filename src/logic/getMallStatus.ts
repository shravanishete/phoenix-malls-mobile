import { DateTime } from 'luxon'
import type { DayHours, DayOfWeek } from '../types/operatingHours'
import type { Mall } from '../types/mall'
import type { MallStatus } from '../types/mallStatus'

const DAYS: DayOfWeek[] = [
  'monday', 'tuesday', 'wednesday', 'thursday',
  'friday', 'saturday', 'sunday',
]

interface Span {
  open: number 
  close: number 
  overnight: boolean
}

function toMinutes(time: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time)
  return match ? Number(match[1]) * 60 + Number(match[2]) : null
}

function toSpan(hours: DayHours): Span | null {
  const open = toMinutes(hours.open)
  const close = toMinutes(hours.close)
  if (open === null || close === null || open === close) return null
  return { open, close, overnight: close < open }
}


export function getMallStatus(
  mall: Pick<Mall, 'timezone' | 'operatingHours'>,
  now: DateTime = DateTime.now(),
): MallStatus {
  const local = now.setZone(mall.timezone)
  if (!local.isValid) {
    return { status: 'unavailable', todayHours: null, reason: 'invalid-timezone' }
  }

  const todayIndex = local.weekday - 1
  const current = local.hour * 60 + local.minute

  const yesterdayHours = mall.operatingHours[DAYS[(todayIndex + 6) % 7]]
  if (yesterdayHours) {
    const span = toSpan(yesterdayHours)
    if (span && span.overnight && current < span.close) {
      return { status: 'open', todayHours: yesterdayHours, reason: 'within-hours' }
    }
  }

  const hours: DayHours | null | undefined = mall.operatingHours[DAYS[todayIndex]]

  if (hours === undefined) {
    return { status: 'unavailable', todayHours: null, reason: 'missing-hours' }
  }
  if (hours === null) {
    return { status: 'closed', todayHours: null, reason: 'closed-today' }
  }

  const span = toSpan(hours)
  if (!span) {
    return { status: 'unavailable', todayHours: null, reason: 'invalid-hours' }
  }

  if (current < span.open) {
    return { status: 'closed', todayHours: hours, reason: 'before-opening' }
  }
  if (!span.overnight && current >= span.close) {
    return { status: 'closed', todayHours: hours, reason: 'after-closing' }
  }
  return { status: 'open', todayHours: hours, reason: 'within-hours' }
}