import { z } from 'zod'
import { apiGet, apiPost } from './api'

export const announcementTypeSchema = z.enum([
  'update',
  'scheduled_maintenance',
  'maintenance_in_progress',
  'maintenance_completed',
  'incident',
])

export const announcementAreaSchema = z.enum([
  'site',
  'apod',
  'academy',
  'missions',
  'simulator',
  'quiz',
  'explorer',
  'progress',
  'api',
])

export const announcementSchema = z.object({
  id: z.string().min(1),
  type: announcementTypeSchema,
  status: z.enum(['draft', 'scheduled', 'published', 'completed', 'archived']),
  titleFr: z.string(),
  titleEn: z.string(),
  descriptionFr: z.string(),
  descriptionEn: z.string(),
  publishedAt: z.string().datetime({ offset: true }).nullable(),
  startAt: z.string().datetime({ offset: true }).nullable(),
  endAt: z.string().datetime({ offset: true }).nullable(),
  critical: z.boolean(),
  areas: z.array(announcementAreaSchema),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
})

export const maintenanceSettingsSchema = z.object({
  enabled: z.boolean(),
  titleFr: z.string(),
  titleEn: z.string(),
  messageFr: z.string(),
  messageEn: z.string(),
  estimatedEndAt: z.string().datetime({ offset: true }).nullable(),
  contactEmail: z.string().email().nullable(),
  updatedAt: z.string().datetime({ offset: true }),
})

const publicAnnouncementsSchema = z.object({
  announcements: z.array(announcementSchema),
  maintenance: maintenanceSettingsSchema,
})

const announcementListSchema = z.object({
  announcements: z.array(announcementSchema),
})

const maintenanceResponseSchema = z.object({
  maintenance: maintenanceSettingsSchema,
})

const announcementResponseSchema = z.object({
  announcement: announcementSchema,
})

export type Announcement = z.infer<typeof announcementSchema>
export type AnnouncementType = z.infer<typeof announcementTypeSchema>
export type AnnouncementArea = z.infer<typeof announcementAreaSchema>
export type AnnouncementStatus = Announcement['status']
export type MaintenanceSettings = z.infer<typeof maintenanceSettingsSchema>

export interface AnnouncementInput {
  type: AnnouncementType
  status: 'draft' | 'scheduled' | 'published'
  titleFr: string
  titleEn: string
  descriptionFr: string
  descriptionEn: string
  publishedAt: string | null
  startAt: string | null
  endAt: string | null
  critical: boolean
  areas: AnnouncementArea[]
}

export interface AnnouncementStatusInput {
  status: 'draft' | 'scheduled' | 'published' | 'archived'
  publishedAt: string | null
}

export type MaintenanceSettingsInput = Omit<MaintenanceSettings, 'updatedAt'>

const authHeaders = (token: string) => ({ authorization: `Bearer ${token}` })

export const getPublicAnnouncements = (signal?: AbortSignal) =>
  apiGet('/api/announcements', publicAnnouncementsSchema, signal)

export const getAnnouncementHistory = (signal?: AbortSignal) =>
  apiGet('/api/announcements/history', announcementListSchema, signal)

export const getAdminAnnouncements = (token: string) =>
  apiGet('/api/admin/announcements', announcementListSchema, undefined, authHeaders(token))

export const createAnnouncement = (token: string, input: AnnouncementInput) =>
  apiPost('/api/admin/announcements', input, announcementResponseSchema, authHeaders(token))

export const updateAnnouncement = (token: string, id: string, input: AnnouncementInput) =>
  apiPost(`/api/admin/announcements/${encodeURIComponent(id)}/update`, input, announcementResponseSchema, authHeaders(token))

export const setAnnouncementStatus = (token: string, id: string, input: AnnouncementStatusInput) =>
  apiPost(`/api/admin/announcements/${encodeURIComponent(id)}/status`, input, announcementResponseSchema, authHeaders(token))

export const getAdminMaintenanceSettings = (token: string) =>
  apiGet('/api/admin/maintenance', maintenanceResponseSchema, undefined, authHeaders(token))

export const saveAdminMaintenanceSettings = (token: string, input: MaintenanceSettingsInput) =>
  apiPost('/api/admin/maintenance', input, maintenanceResponseSchema, authHeaders(token))
