export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface DayHours {
  open: string 
  close: string 
}


export type OperatingHours = Partial<Record<DayOfWeek, DayHours | null>>