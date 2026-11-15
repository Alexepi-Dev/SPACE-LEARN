import type { RequestHandler } from 'express'
import { z } from 'zod'
import type { SolarSystemEphemeris } from '../services/horizons.service.js'

const querySchema = z.object({
  include_moons: z.enum(['true', 'false']).default('false').transform((value) => value === 'true'),
}).strict()

export function createSolarSystemController(
  service: { getEphemeris: (includeMoons: boolean) => Promise<SolarSystemEphemeris> },
): RequestHandler {
  return async (request, response, next) => {
    const query = querySchema.safeParse(request.query)
    if (!query.success) {
      response.status(400).json({
        error: {
          code: 'INVALID_SOLAR_SYSTEM_QUERY',
          message: 'include_moons must be true or false.',
        },
      })
      return
    }

    try {
      response.json(await service.getEphemeris(query.data.include_moons))
    } catch (error) {
      next(error)
    }
  }
}
