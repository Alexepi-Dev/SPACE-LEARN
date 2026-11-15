import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { z } from 'zod'
import type { ServerConfig } from '../config/env.js'
import { ApiError } from '../middleware/apiError.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { createAdminToken, verifyPassword } from '../services/adminAuth.js'
import { checkAdminDatabase, getAdminAuditLog, recordAdminAction, recordAdminLogin } from '../services/adminDatabase.js'
import type { RequestMetrics } from '../services/requestMetrics.js'
import {
  announcementAreas,
  announcementTypes,
  createSiteAnnouncementsStore,
  type AnnouncementInput,
  type AnnouncementStatusInput,
  type MaintenanceSettingsInput,
  type SiteAnnouncementsStore,
} from '../services/siteAnnouncements.js'

const credentialsSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(256),
})

const nullableDateSchema = z.string().datetime({ offset: true }).nullable()
const announcementInputSchema = z.object({
  type: z.enum(announcementTypes),
  status: z.enum(['draft', 'scheduled', 'published']),
  titleFr: z.string().trim().min(1).max(160),
  titleEn: z.string().trim().min(1).max(160),
  descriptionFr: z.string().trim().min(1).max(2_000),
  descriptionEn: z.string().trim().min(1).max(2_000),
  publishedAt: nullableDateSchema,
  startAt: nullableDateSchema,
  endAt: nullableDateSchema,
  critical: z.boolean(),
  areas: z.array(z.enum(announcementAreas)).min(1).max(announcementAreas.length),
}).refine((value) => value.status !== 'scheduled' || value.publishedAt !== null, {
  message: 'A scheduled announcement needs a publication date.',
  path: ['publishedAt'],
}).refine((value) => !value.startAt || !value.endAt || Date.parse(value.endAt) > Date.parse(value.startAt), {
  message: 'The end date must be later than the start date.',
  path: ['endAt'],
})
const announcementStatusSchema = z.object({
  status: z.enum(['draft', 'scheduled', 'published', 'archived']),
  publishedAt: nullableDateSchema,
}).refine((value) => value.status !== 'scheduled' || value.publishedAt !== null, {
  message: 'A scheduled announcement needs a publication date.',
  path: ['publishedAt'],
})
const maintenanceInputSchema = z.object({
  enabled: z.boolean(),
  titleFr: z.string().trim().min(1).max(160),
  titleEn: z.string().trim().min(1).max(160),
  messageFr: z.string().trim().min(1).max(2_000),
  messageEn: z.string().trim().min(1).max(2_000),
  estimatedEndAt: nullableDateSchema,
  contactEmail: z.union([z.string().email().max(254), z.literal('')]).transform((value) => value || null),
})
const announcementIdSchema = z.string().regex(/^[1-9]\d{0,17}$/)

export function createAdminRouter(
  config: Pick<ServerConfig, 'databaseUrl' | 'adminEmail' | 'adminPasswordHash' | 'adminSessionSecret'>,
  requestMetrics: RequestMetrics,
  fetcher: typeof fetch = fetch,
  announcementsStore: SiteAnnouncementsStore = createSiteAnnouncementsStore(config.databaseUrl),
) {
  const router = Router()
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_request, response) => {
      response.status(429).json({
        error: {
          code: 'ADMIN_LOGIN_RATE_LIMITED',
          message: 'Too many login attempts. Please try again later.',
        },
      })
    },
  })

  router.post('/session', loginLimiter, async (request, response, next) => {
    const credentials = credentialsSchema.safeParse(request.body)
    if (!credentials.success) {
      next(new ApiError(400, 'INVALID_CREDENTIALS', 'Enter a valid administrator email and password.'))
      return
    }

    if (!config.databaseUrl || !config.adminEmail || !config.adminPasswordHash || !config.adminSessionSecret) {
      next(new ApiError(503, 'ADMIN_NOT_CONFIGURED', 'Administrator access is not fully configured on the server.'))
      return
    }

    try {
      await checkAdminDatabase(config.databaseUrl)
    } catch {
      next(new ApiError(503, 'ADMIN_AUDIT_UNAVAILABLE', 'Administrator audit storage is unavailable.'))
      return
    }

    try {
      const emailMatches = credentials.data.email.toLowerCase() === config.adminEmail
      const passwordMatches = await verifyPassword(credentials.data.password, config.adminPasswordHash)
      const authenticated = emailMatches && passwordMatches
      try {
        await recordAdminLogin(
          config.databaseUrl,
          authenticated ? config.adminEmail : 'authentication_attempt',
          authenticated ? 'success' : 'failure',
        )
      } catch {
        next(new ApiError(503, 'ADMIN_AUDIT_UNAVAILABLE', 'Run the administrator database migration before signing in.'))
        return
      }

      if (!authenticated) {
        next(new ApiError(401, 'ADMIN_UNAUTHORIZED', 'The email or password is incorrect.'))
        return
      }

      response.json({
        ...createAdminToken({ email: config.adminEmail, role: 'superadmin' }, config.adminSessionSecret),
        role: 'superadmin',
      })
    } catch (error) {
      next(error)
    }
  })

  router.use(requireAdmin(config))
  router.use(async (request, _response, next) => {
    if (!config.databaseUrl || !request.adminIdentity) {
      next(new ApiError(503, 'ADMIN_AUDIT_UNAVAILABLE', 'Administrator audit storage is unavailable.'))
      return
    }
    try {
      await recordAdminAction(
        config.databaseUrl,
        request.adminIdentity.email,
        `admin_${request.method.toLowerCase()}`,
        `/api/admin${request.path}`,
      )
      next()
    } catch {
      next(new ApiError(503, 'ADMIN_AUDIT_UNAVAILABLE', 'Administrator audit storage is unavailable.'))
    }
  })

  router.get('/overview', (_request, response) => {
    response.json({
      observedAt: new Date().toISOString(),
      api: {
        status: 'operational',
        uptimeSeconds: Math.floor(process.uptime()),
      },
      monitoring: requestMetrics.snapshot(),
      dataAvailability: {
        learnerAccounts: 'not_configured',
        learnerActivity: 'not_collected',
        contentManagement: 'static_catalog',
        analytics: 'not_configured',
      },
    })
  })

  router.get('/services', async (_request, response) => {
    const observedAt = new Date().toISOString()
    let apod: { status: 'operational' | 'unavailable'; responseTimeMs: number | null }
    const startedAt = Date.now()
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8_000)
      try {
        const upstream = await fetcher('https://science.nasa.gov/wp-json/wp/v2/apod-basic?per_page=1', {
          headers: { accept: 'application/json' },
          signal: controller.signal,
        })
        const payload: unknown = await upstream.json()
        apod = {
          status: upstream.ok && Array.isArray(payload) ? 'operational' : 'unavailable',
          responseTimeMs: Date.now() - startedAt,
        }
      } finally {
        clearTimeout(timeout)
      }
    } catch {
      apod = { status: 'unavailable', responseTimeMs: Date.now() - startedAt }
    }

    let databaseStatus: 'operational' | 'unavailable' | 'not_configured'
    if (!config.databaseUrl) {
      databaseStatus = 'not_configured'
    } else {
      try {
        await checkAdminDatabase(config.databaseUrl)
        databaseStatus = 'operational'
      } catch {
        databaseStatus = 'unavailable'
      }
    }

    response.json({
      observedAt,
      services: [
        { name: 'API', status: 'operational' },
        { name: 'PostgreSQL', status: databaseStatus },
        { name: 'NASA APOD', status: apod.status, responseTimeMs: apod.responseTimeMs },
        { name: 'NASA NeoWs', status: 'not_configured' },
        { name: 'NASA DONKI', status: 'not_configured' },
        { name: 'NASA Image and Video Library', status: 'not_configured' },
        { name: 'NASA Exoplanet Archive', status: 'not_configured' },
        { name: 'NASA Earthdata / GIBS', status: 'not_configured' },
        { name: 'NASA PDS', status: 'not_configured' },
        { name: 'NASA Solar System Exploration', status: 'not_configured' },
        { name: 'JPL Horizons', status: 'not_configured' },
      ],
    })
  })

  router.get('/audit-log', async (_request, response, next) => {
    if (!config.databaseUrl) {
      next(new ApiError(503, 'DATABASE_NOT_CONFIGURED', 'Audit storage is not configured.'))
      return
    }
    try {
      response.json({ entries: await getAdminAuditLog(config.databaseUrl) })
    } catch (error) {
      next(error)
    }
  })

  router.get('/announcements', async (_request, response, next) => {
    try {
      response.json({ announcements: await announcementsStore.getAdminAnnouncements() })
    } catch (error) {
      next(error)
    }
  })

  router.post('/announcements', async (request, response, next) => {
    const parsed = announcementInputSchema.safeParse(request.body)
    if (!parsed.success) {
      next(new ApiError(400, 'INVALID_ANNOUNCEMENT', 'The announcement details are invalid.'))
      return
    }
    if (!request.adminIdentity) {
      next(new ApiError(401, 'ADMIN_UNAUTHORIZED', 'Administrator authentication is required.'))
      return
    }
    try {
      const announcement = await announcementsStore.createAnnouncement(parsed.data as AnnouncementInput, request.adminIdentity.email)
      response.status(201).json({ announcement })
    } catch (error) {
      next(error)
    }
  })

  router.post('/announcements/:id/update', async (request, response, next) => {
    const id = announcementIdSchema.safeParse(request.params.id)
    const parsed = announcementInputSchema.safeParse(request.body)
    if (!id.success || !parsed.success) {
      next(new ApiError(400, 'INVALID_ANNOUNCEMENT', 'The announcement details are invalid.'))
      return
    }
    if (!request.adminIdentity) {
      next(new ApiError(401, 'ADMIN_UNAUTHORIZED', 'Administrator authentication is required.'))
      return
    }
    try {
      response.json({
        announcement: await announcementsStore.updateAnnouncement(id.data, parsed.data as AnnouncementInput, request.adminIdentity.email),
      })
    } catch (error) {
      next(error)
    }
  })

  router.post('/announcements/:id/status', async (request, response, next) => {
    const id = announcementIdSchema.safeParse(request.params.id)
    const parsed = announcementStatusSchema.safeParse(request.body)
    if (!id.success || !parsed.success) {
      next(new ApiError(400, 'INVALID_ANNOUNCEMENT_STATUS', 'The requested announcement status is invalid.'))
      return
    }
    if (!request.adminIdentity) {
      next(new ApiError(401, 'ADMIN_UNAUTHORIZED', 'Administrator authentication is required.'))
      return
    }
    try {
      response.json({
        announcement: await announcementsStore.setAnnouncementStatus(
          id.data,
          parsed.data as AnnouncementStatusInput,
          request.adminIdentity.email,
        ),
      })
    } catch (error) {
      next(error)
    }
  })

  router.get('/maintenance', async (_request, response, next) => {
    try {
      response.json({ maintenance: await announcementsStore.getMaintenance() })
    } catch (error) {
      next(error)
    }
  })

  router.post('/maintenance', async (request, response, next) => {
    const parsed = maintenanceInputSchema.safeParse(request.body)
    if (!parsed.success) {
      next(new ApiError(400, 'INVALID_MAINTENANCE_SETTINGS', 'The maintenance settings are invalid.'))
      return
    }
    if (!request.adminIdentity) {
      next(new ApiError(401, 'ADMIN_UNAUTHORIZED', 'Administrator authentication is required.'))
      return
    }
    try {
      response.json({
        maintenance: await announcementsStore.setMaintenance(
          parsed.data as MaintenanceSettingsInput,
          request.adminIdentity.email,
        ),
      })
    } catch (error) {
      next(error)
    }
  })

  return router
}
