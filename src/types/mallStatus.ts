import type { DayHours } from './operatingHours'


export type MallStatusKind = 'open' | 'closed' | 'unavailable'

export interface MallStatus {
  status: MallStatusKind
 
  todayHours: DayHours | null
  reason:
    | 'within-hours'
    | 'before-opening'
    | 'after-closing'
    | 'closed-today'
    | 'missing-hours'
    | 'invalid-hours'
    | 'invalid-timezone'
}