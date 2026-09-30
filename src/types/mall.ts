import type { OperatingHours } from './operatingHours'

export interface Mall {
  id: string
  name: string
  country: string
  countryCode: string
  city: string
  latitude: number
  longitude: number
  image: string
  address: string
  phone?: string
  website?: string
  timezone: string
  operatingHours: OperatingHours
}