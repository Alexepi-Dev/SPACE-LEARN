import type { Request, RequestHandler } from 'express'
import type { ServerConfig } from '../config/env.js'
import { ApiError } from './apiError.js'
import { verifyAdminToken, type AdminIdentity } from '../services/adminAuth.js'

declare global {
  namespace Express {
    interface Request {
      adminIdentity?: AdminIdentity
    }
  }
}

export function requireAdmin(config: Pick<ServerConfig, 'adminSessionSecret'>): RequestHandler {
  return (request: Request, _response, next) => {
    if (!config.adminSessionSecret) {
      next(new ApiError(503, 'ADMIN_NOT_CONFIGURED', 'Administrator access is not configured.'))
      return
    }

    const authorization = request.get('authorization')
    const match = authorization?.match(/^Bearer ([^\s]+)$/)
    if (!match) {
      next(new ApiError(401, 'ADMIN_UNAUTHORIZED', 'Administrator authentication is required.'))
      return
    }

    try {
      request.adminIdentity = verifyAdminToken(match[1], config.adminSessionSecret)
      next()
    } catch (error) {
      next(error)
    }
  }
}
