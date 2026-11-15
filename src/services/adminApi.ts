import { z } from 'zod'
import { apiGet, apiPost } from './api'

const sessionSchema = z.object({
  token: z.string().min(1),
  expiresAt: z.string().datetime(),
  role: z.literal('superadmin'),
})

const overviewSchema = z.object({
  observedAt: z.string().datetime(),
  api: z.object({
    status: z.literal('operational'),
    uptimeSeconds: z.number().nonnegative(),
  }),
  monitoring: z.object({
    observedAt: z.string().datetime(),
    windowMinutes: z.number().positive(),
    totals: z.object({
      requests: z.number().nonnegative(),
      clientErrors: z.number().nonnegative(),
      serverErrors: z.number().nonnegative(),
      averageResponseTimeMs: z.number().nonnegative(),
    }),
    series: z.array(z.object({
      startsAt: z.string().datetime(),
      requests: z.number().nonnegative(),
      errors: z.number().nonnegative(),
      averageResponseTimeMs: z.number().nonnegative(),
    })),
  }),
  dataAvailability: z.object({
    learnerAccounts: z.literal('not_configured'),
    learnerActivity: z.literal('not_collected'),
    contentManagement: z.literal('static_catalog'),
    analytics: z.literal('not_configured'),
  }),
})

const servicesSchema = z.object({
  observedAt: z.string().datetime(),
  services: z.array(z.object({
    name: z.string(),
    status: z.enum(['operational', 'unavailable', 'not_configured']),
    responseTimeMs: z.number().nonnegative().nullable().optional(),
  })),
})

const auditSchema = z.object({
  entries: z.array(z.object({
    action: z.string(),
    resource: z.string(),
    result: z.enum(['success', 'failure']),
    occurredAt: z.string().datetime(),
  })),
})

export type AdminSession = z.infer<typeof sessionSchema>
export type AdminOverview = z.infer<typeof overviewSchema>
export type AdminServices = z.infer<typeof servicesSchema>
export type AdminAuditLog = z.infer<typeof auditSchema>

export const loginAdmin = (email: string, password: string) =>
  apiPost('/api/admin/session', { email, password }, sessionSchema)

const authHeaders = (token: string) => ({ authorization: `Bearer ${token}` })

export const getAdminOverview = (token: string) =>
  apiGet('/api/admin/overview', overviewSchema, undefined, authHeaders(token))

export const getAdminServices = (token: string) =>
  apiGet('/api/admin/services', servicesSchema, undefined, authHeaders(token))

export const getAdminAuditLog = (token: string) =>
  apiGet('/api/admin/audit-log', auditSchema, undefined, authHeaders(token))
