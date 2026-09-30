import countriesJson from '../data/countries.json'
import mallsJson from '../data/malls.json'
import type { Country } from '../types/country'
import type { Mall } from '../types/mall'
import type { MallRepository } from './mallRepository'

const countries: Country[] = countriesJson
const malls: Mall[] = mallsJson

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export function createMockMallRepository(delayMs = 300): MallRepository {
  return {
    async getCountries() {
      await wait(delayMs)
      return [...countries]
    },

    async getMallsByCountry(countryCode) {
      await wait(delayMs)
      const code = countryCode.toUpperCase()
      return malls.filter((mall) => mall.countryCode === code)
    },

    async getMallById(mallId) {
      await wait(delayMs)
      return malls.find((mall) => mall.id === mallId) ?? null
    },
        async getAllMalls() {
      await wait(delayMs)
      return [...malls]
    },
    async searchMalls(query) {
      await wait(delayMs)
      const text = query.trim().toLowerCase()
      if (!text) return []
      return malls.filter((mall) =>
        [mall.name, mall.city, mall.country].some((field) =>
          field.toLowerCase().includes(text),
        ),
      )
    },
  }
}