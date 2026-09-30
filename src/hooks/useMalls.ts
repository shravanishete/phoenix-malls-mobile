import { useCallback } from 'react'
import { mallService } from '../services/mallService'
import type { Mall } from '../types/mall'
import { useAsync } from './useAsync'

const NO_MALLS: Mall[] = []

export function useMalls(countryCode: string | null) {
  const load = useCallback(
    () =>
      countryCode
        ? mallService.getMallsByCountry(countryCode)
        : Promise.resolve(NO_MALLS),
    [countryCode],
  )
  return useAsync<Mall[]>(load)
}