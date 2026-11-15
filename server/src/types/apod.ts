import type { ApodQuery } from '../services/apod.service.js'

export interface ApodService {
  getPage(query: ApodQuery): Promise<unknown>
}
