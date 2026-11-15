import { Router } from 'express'
import { createApodController } from '../controllers/apod.controller.js'
import { createSolarSystemController } from '../controllers/solarSystem.controller.js'
import { apodService } from '../services/apod.service.js'
import { horizonsService, type HorizonsService } from '../services/horizons.service.js'
import type { ApodService } from '../types/apod.js'

export function createSpaceRouter(
  service: ApodService = apodService,
  solarSystem: HorizonsService = horizonsService,
) {
  const router = Router()

  router.get('/apod', createApodController(service))
  router.get('/solar-system', createSolarSystemController(solarSystem))
  return router
}
