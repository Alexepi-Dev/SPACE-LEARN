import type { RequestHandler } from 'express'
import { z } from 'zod'
import type { ApodQuery } from '../services/apod.service.js'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(20_000).default(1),
  per_page: z.coerce.number().int().min(1).max(20).default(8),
  language: z.enum(['en', 'fr']).optional(),
}).strict()

export function createApodController(
  service: { getPage: (query: ApodQuery) => Promise<unknown> },
): RequestHandler {
  return async (request, response, next) => {
    const query = querySchema.safeParse(request.query)
    if (!query.success) {
      response.status(400).json({
        error: {
          code: 'INVALID_PAGINATION',
          message: 'Use a page from 1 to 20000 and per_page from 1 to 20.',
        },
      })
      return
    }

    try {
      const acceptLanguage = request.get('accept-language')?.split(',')[0]?.split('-')[0]?.toLowerCase()
      response.json(await service.getPage({
        page: query.data.page,
        perPage: query.data.per_page,
        language: query.data.language ?? (acceptLanguage === 'fr' ? 'fr' : 'en'),
      }))
    } catch (error) {
      next(error)
    }
  }
}
