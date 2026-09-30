import type { MallRepository } from './mallRepository'
import { createMockMallRepository } from './mockMallRepository'

const repository: MallRepository = createMockMallRepository()

export class ServiceError extends Error {}

async function run<T>(action: () => Promise<T>, message: string): Promise<T> {
  try {
    return await action()
  } catch (cause) {
    throw new ServiceError(message, { cause })
  }
}

export const mallService = {
  getCountries: () =>
    run(() => repository.getCountries(), 'Could not load countries.'),

  getMallsByCountry: (countryCode: string) =>
    run(() => repository.getMallsByCountry(countryCode), 'Could not load malls.'),

  getMallById: (mallId: string) =>
    run(() => repository.getMallById(mallId), 'Could not load mall details.'),

  searchMalls: (query: string) =>
    run(() => repository.searchMalls(query), 'Search failed. Please try again.'),
  getAllMalls: () =>
    run(() => repository.getAllMalls(), 'Could not load malls.'),
}