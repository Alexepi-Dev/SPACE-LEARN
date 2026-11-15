import { Router, type RequestHandler } from 'express'
import { ApiError } from '../middleware/apiError.js'
import type { SiteAnnouncementsStore } from '../services/siteAnnouncements.js'

export function createAnnouncementsRouter(store: SiteAnnouncementsStore) {
  const router = Router()

  router.get('/', async (_request, response, next) => {
    try {
      const [announcements, maintenance] = await Promise.all([
        store.getPublicAnnouncements(),
        store.getMaintenance(),
      ])
      response.json({ announcements, maintenance })
    } catch (error) {
      next(error)
    }
  })

  router.get('/history', async (_request, response, next) => {
    try {
      response.json({ announcements: await store.getAnnouncementHistory() })
    } catch (error) {
      next(error)
    }
  })

  return router
}

export function createMaintenanceGuard(store: SiteAnnouncementsStore): RequestHandler {
  return async (_request, _response, next) => {
    if (!store.isConfigured) {
      next()
      return
    }
    try {
      const maintenance = await store.getMaintenance()
      if (maintenance.enabled) {
        next(new ApiError(503, 'SITE_MAINTENANCE', 'The site is temporarily under maintenance.'))
        return
      }
      next()
    } catch (error) {
      next(error)
    }
  }
}
