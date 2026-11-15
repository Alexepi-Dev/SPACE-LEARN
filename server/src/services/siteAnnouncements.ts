import { ApiError } from '../middleware/apiError.js'
import { getAdminDatabasePool } from './adminDatabase.js'

export const announcementTypes = [
  'update',
  'scheduled_maintenance',
  'maintenance_in_progress',
  'maintenance_completed',
  'incident',
] as const

export const announcementAreas = [
  'site',
  'apod',
  'academy',
  'missions',
  'simulator',
  'quiz',
  'explorer',
  'progress',
  'api',
] as const

export type AnnouncementType = typeof announcementTypes[number]
export type AnnouncementArea = typeof announcementAreas[number]
export type AnnouncementStatus = 'draft' | 'scheduled' | 'published' | 'completed' | 'archived'
export type StoredAnnouncementStatus = Exclude<AnnouncementStatus, 'completed'>

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

export interface SiteAnnouncement {
  id: string
  type: AnnouncementType
  status: AnnouncementStatus
  titleFr: string
  titleEn: string
  descriptionFr: string
  descriptionEn: string
  publishedAt: string | null
  startAt: string | null
  endAt: string | null
  critical: boolean
  areas: AnnouncementArea[]
  createdAt: string
  updatedAt: string
}

export interface MaintenanceSettings {
  enabled: boolean
  titleFr: string
  titleEn: string
  messageFr: string
  messageEn: string
  estimatedEndAt: string | null
  contactEmail: string | null
  updatedAt: string
}

export interface MaintenanceSettingsInput extends Omit<MaintenanceSettings, 'updatedAt'> {}

export interface SiteAnnouncementsStore {
  readonly isConfigured: boolean
  getPublicAnnouncements(): Promise<SiteAnnouncement[]>
  getAnnouncementHistory(): Promise<SiteAnnouncement[]>
  getAdminAnnouncements(): Promise<SiteAnnouncement[]>
  createAnnouncement(input: AnnouncementInput, actor: string): Promise<SiteAnnouncement>
  updateAnnouncement(id: string, input: AnnouncementInput, actor: string): Promise<SiteAnnouncement>
  setAnnouncementStatus(id: string, input: AnnouncementStatusInput, actor: string): Promise<SiteAnnouncement>
  getMaintenance(): Promise<MaintenanceSettings>
  setMaintenance(input: MaintenanceSettingsInput, actor: string): Promise<MaintenanceSettings>
}

interface AnnouncementRow {
  id: string
  type: AnnouncementType
  status: StoredAnnouncementStatus
  title_fr: string
  title_en: string
  description_fr: string
  description_en: string
  published_at: Date | string | null
  start_at: Date | string | null
  end_at: Date | string | null
  critical: boolean
  areas: AnnouncementArea[]
  created_at: Date | string
  updated_at: Date | string
}

interface MaintenanceRow {
  enabled: boolean
  title_fr: string
  title_en: string
  message_fr: string
  message_en: string
  estimated_end_at: Date | string | null
  contact_email: string | null
  updated_at: Date | string
}

function toIso(value: Date | string | null): string | null {
  if (value === null) return null
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

export function getEffectiveAnnouncementStatus(
  status: StoredAnnouncementStatus,
  publishedAt: string | null,
  endAt: string | null,
  now = Date.now(),
): AnnouncementStatus {
  if (status === 'draft' || status === 'archived') return status
  if (endAt && Date.parse(endAt) <= now) return 'completed'
  if (publishedAt && Date.parse(publishedAt) > now) return 'scheduled'
  return 'published'
}

function mapAnnouncement(row: AnnouncementRow, now?: number): SiteAnnouncement {
  const publishedAt = toIso(row.published_at)
  const startAt = toIso(row.start_at)
  const endAt = toIso(row.end_at)

  return {
    id: row.id,
    type: row.type,
    status: getEffectiveAnnouncementStatus(row.status, publishedAt, endAt, now),
    titleFr: row.title_fr,
    titleEn: row.title_en,
    descriptionFr: row.description_fr,
    descriptionEn: row.description_en,
    publishedAt,
    startAt,
    endAt,
    critical: row.critical,
    areas: row.areas,
    createdAt: toIso(row.created_at)!,
    updatedAt: toIso(row.updated_at)!,
  }
}

function mapMaintenance(row: MaintenanceRow): MaintenanceSettings {
  return {
    enabled: row.enabled,
    titleFr: row.title_fr,
    titleEn: row.title_en,
    messageFr: row.message_fr,
    messageEn: row.message_en,
    estimatedEndAt: toIso(row.estimated_end_at),
    contactEmail: row.contact_email,
    updatedAt: toIso(row.updated_at)!,
  }
}

export function createSiteAnnouncementsStore(databaseUrl?: string): SiteAnnouncementsStore {
  const isConfigured = Boolean(databaseUrl)

  function getPool() {
    if (!databaseUrl) {
      throw new ApiError(503, 'ANNOUNCEMENT_STORAGE_UNAVAILABLE', 'Announcement storage is not configured.')
    }
    return getAdminDatabasePool(databaseUrl)
  }

  async function getAnnouncement(id: string): Promise<SiteAnnouncement> {
    const result = await getPool().query<AnnouncementRow>(
      `SELECT id::text, type, status, title_fr, title_en, description_fr, description_en,
              published_at, start_at, end_at, critical, areas, created_at, updated_at
       FROM site_announcements
       WHERE id = $1`,
      [id],
    )
    if (!result.rows[0]) {
      throw new ApiError(404, 'ANNOUNCEMENT_NOT_FOUND', 'The announcement could not be found.')
    }
    return mapAnnouncement(result.rows[0])
  }

  return {
    isConfigured,
    async getPublicAnnouncements() {
      const result = await getPool().query<AnnouncementRow>(
        `SELECT id::text, type, status, title_fr, title_en, description_fr, description_en,
                published_at, start_at, end_at, critical, areas, created_at, updated_at
         FROM site_announcements
         WHERE status IN ('scheduled', 'published')
           AND published_at <= NOW()
           AND (end_at IS NULL OR end_at > NOW())
         ORDER BY critical DESC, published_at DESC`,
      )
      return result.rows.map((row) => mapAnnouncement(row))
    },
    async getAnnouncementHistory() {
      const result = await getPool().query<AnnouncementRow>(
        `SELECT id::text, type, status, title_fr, title_en, description_fr, description_en,
                published_at, start_at, end_at, critical, areas, created_at, updated_at
         FROM site_announcements
         WHERE status IN ('scheduled', 'published')
           AND published_at <= NOW()
         ORDER BY COALESCE(end_at, published_at) DESC
         LIMIT 100`,
      )
      return result.rows.map((row) => mapAnnouncement(row))
    },
    async getAdminAnnouncements() {
      const result = await getPool().query<AnnouncementRow>(
        `SELECT id::text, type, status, title_fr, title_en, description_fr, description_en,
                published_at, start_at, end_at, critical, areas, created_at, updated_at
         FROM site_announcements
         ORDER BY created_at DESC
         LIMIT 200`,
      )
      return result.rows.map((row) => mapAnnouncement(row))
    },
    async createAnnouncement(input, actor) {
      const result = await getPool().query<{ id: string }>(
        `INSERT INTO site_announcements (
           type, status, title_fr, title_en, description_fr, description_en,
           published_at, start_at, end_at, critical, areas, created_by, updated_by
         )
         VALUES (
           $1, $2, $3, $4, $5, $6,
           CASE WHEN $2 = 'draft' THEN $7::timestamptz
                ELSE COALESCE($7::timestamptz, NOW()) END,
           $8::timestamptz, $9::timestamptz, $10, $11, $12, $12
         )
         RETURNING id::text`,
        [
          input.type,
          input.status,
          input.titleFr,
          input.titleEn,
          input.descriptionFr,
          input.descriptionEn,
          input.publishedAt,
          input.startAt,
          input.endAt,
          input.critical,
          input.areas,
          actor,
        ],
      )
      return getAnnouncement(result.rows[0].id)
    },
    async updateAnnouncement(id, input, actor) {
      await getPool().query(
        `UPDATE site_announcements
         SET type = $2,
             status = $3,
             title_fr = $4,
             title_en = $5,
             description_fr = $6,
             description_en = $7,
             published_at = CASE WHEN $3 = 'draft' THEN $8::timestamptz
                                 ELSE COALESCE($8::timestamptz, NOW()) END,
             start_at = $9::timestamptz,
             end_at = $10::timestamptz,
             critical = $11,
             areas = $12,
             updated_by = $13,
             updated_at = NOW()
         WHERE id = $1`,
        [
          id,
          input.type,
          input.status,
          input.titleFr,
          input.titleEn,
          input.descriptionFr,
          input.descriptionEn,
          input.publishedAt,
          input.startAt,
          input.endAt,
          input.critical,
          input.areas,
          actor,
        ],
      )
      return getAnnouncement(id)
    },
    async setAnnouncementStatus(id, input, actor) {
      await getPool().query(
        `UPDATE site_announcements
         SET status = $2,
             published_at = CASE WHEN $2 = 'published' THEN COALESCE($3::timestamptz, NOW())
                                 WHEN $3::timestamptz IS NOT NULL THEN $3::timestamptz
                                 ELSE published_at END,
             updated_by = $4,
             updated_at = NOW()
         WHERE id = $1`,
        [id, input.status, input.publishedAt, actor],
      )
      return getAnnouncement(id)
    },
    async getMaintenance() {
      const result = await getPool().query<MaintenanceRow>(
        `SELECT enabled, title_fr, title_en, message_fr, message_en,
                estimated_end_at, contact_email, updated_at
         FROM site_maintenance
         WHERE id = 1`,
      )
      if (!result.rows[0]) {
        throw new ApiError(503, 'MAINTENANCE_STORAGE_UNAVAILABLE', 'The maintenance settings have not been initialized.')
      }
      return mapMaintenance(result.rows[0])
    },
    async setMaintenance(input, actor) {
      const result = await getPool().query<MaintenanceRow>(
        `INSERT INTO site_maintenance (
           id, enabled, title_fr, title_en, message_fr, message_en,
           estimated_end_at, contact_email, updated_by, updated_at
         )
         VALUES (1, $1, $2, $3, $4, $5, $6::timestamptz, $7, $8, NOW())
         ON CONFLICT (id) DO UPDATE
         SET enabled = EXCLUDED.enabled,
             title_fr = EXCLUDED.title_fr,
             title_en = EXCLUDED.title_en,
             message_fr = EXCLUDED.message_fr,
             message_en = EXCLUDED.message_en,
             estimated_end_at = EXCLUDED.estimated_end_at,
             contact_email = EXCLUDED.contact_email,
             updated_by = EXCLUDED.updated_by,
             updated_at = NOW()
         RETURNING enabled, title_fr, title_en, message_fr, message_en,
                   estimated_end_at, contact_email, updated_at`,
        [
          input.enabled,
          input.titleFr,
          input.titleEn,
          input.messageFr,
          input.messageEn,
          input.estimatedEndAt,
          input.contactEmail,
          actor,
        ],
      )
      return mapMaintenance(result.rows[0])
    },
  }
}
