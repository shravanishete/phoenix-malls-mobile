import type { Country } from '../types/country'
import type { Mall } from '../types/mall'


export interface MallRepository {

  getCountries(): Promise<Country[]>

  getMallsByCountry(countryCode: string): Promise<Mall[]>

  getMallById(mallId: string): Promise<Mall | null>

 
  searchMalls(query: string): Promise<Mall[]>
     getAllMalls(): Promise<Mall[]>
}