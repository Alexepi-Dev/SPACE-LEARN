import cors from 'cors'
import express from 'express'
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import type { ServerConfig } from './config/env.js'
import type { ApodService } from './types/apod.js'
import { errorHandler } from './middleware/errorHandler.js'
import { createSpaceRouter } from './routes/space.routes.js'
import { createAdminRouter } from './routes/admin.routes.js'
import { createAnnouncementsRouter, createMaintenanceGuard } from './routes/announcements.routes.js'
import { createRequestMetrics } from './services/requestMetrics.js'
import { createApodService } from './services/apod.service.js'
import { createDeepLTranslator } from './services/deepl.service.js'
import type { HorizonsService } from './services/horizons.service.js'
import { createSiteAnnouncementsStore, type SiteAnnouncementsStore } from './services/siteAnnouncements.js'

export function createApp(
  config: Pick<ServerConfig, 'allowedOrigins'> & Partial<Omit<ServerConfig, 'allowedOrigins'>>,
  apodServiceOverride?: ApodService,
  solarSystemServiceOverride?: HorizonsService,
  siteAnnouncementsStoreOverride?: SiteAnnouncementsStore,
) {
  const app = express()
  const requestMetrics = createRequestMetrics()
  const siteAnnouncementsStore = siteAnnouncementsStoreOverride ?? createSiteAnnouncementsStore(config.databaseUrl)
  const apodService = apodServiceOverride ?? createApodService(
    fetch,
    undefined,
    createDeepLTranslator({
      authKey: config.deeplAuthKey,
      apiUrl: config.deeplApiUrl,
    }),
  )
  app.disable('x-powered-by')
  app.set('trust proxy', 1)

  app.use((req, _res, next) => {
    if (req.url.startsWith('/.netlify/functions/api')) {
      req.url = req.url.replace('/.netlify/functions/api', '/api')
    } else if (!req.url.startsWith('/api')) {
      req.url = '/api' + req.url
    }
    next()
  })

  app.use(helmet())
  app.use(cors({
    origin(origin, callback) {
      if (!origin || config.allowedOrigins.includes('*') || config.allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }
      callback(null, false)
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Accept', 'Accept-Language', 'Content-Type', 'Authorization'],
  }))
  app.use(express.json({ limit: '16kb' }))
  app.use('/api', requestMetrics.middleware)
  app.use('/api', rateLimit({
    windowMs: 60_000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { ip: false },
    handler: (_request, response) => {
      response.status(429).json({
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please try again shortly.',
        },
      })
    },
  }))

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok', service: 'space-learn-africa-api' })
  })

  app.use('/api/announcements', createAnnouncementsRouter(siteAnnouncementsStore))
  app.use('/api/admin', createAdminRouter(config, requestMetrics, fetch, siteAnnouncementsStore))
  app.use('/api', createMaintenanceGuard(siteAnnouncementsStore))
  app.use('/api/space', createSpaceRouter(apodService, solarSystemServiceOverride))

  app.use('/api', (_request, response) => {
    response.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'This API route does not exist.',
      },
    })
  })
  app.use(errorHandler)

  return app
}
