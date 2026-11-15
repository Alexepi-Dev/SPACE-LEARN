import sanitizeHtml from 'sanitize-html'
import { z } from 'zod'
import { ApiError } from '../middleware/apiError.js'
import { HttpCache } from './httpCache.js'

const APOD_ENDPOINT = 'https://science.nasa.gov/wp-json/wp/v2/apod-basic'
const NASA_PAGE_HOSTS = new Set(['science.nasa.gov', 'apod.nasa.gov', 'www.nasa.gov', 'nasa.gov'])
const NASA_MEDIA_HOSTS = new Set(['assets.science.nasa.gov', 'apod.nasa.gov', 'images-assets.nasa.gov'])
const REQUEST_TIMEOUT_MS = 10_000
const CACHE_TTL_MS = 30 * 60 * 1000

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

const rawApodRecordSchema = z.object({
  date: dateSchema,
  title: z.string().trim().min(1).max(300),
  media_type: z.string().min(1).max(40),
  explanation: z.string().max(20_000).optional().default(''),
  permalink: z.string().url().optional(),
  url: z.string().url().optional(),
  hdurl: z.string().url().optional(),
  credit: z.string().max(2_000).optional(),
  copyright: z.string().max(2_000).optional(),
  alt: z.string().max(2_000).optional(),
  basic_html: z.string().max(500_000).optional(),
}).passthrough()

export interface ApodQuery {
  page: number
  perPage: number
}

export interface ApodItem {
  date: string
  title: string
  mediaType: 'image' | 'video' | 'other'
  mediaUrl: string | null
  previewImageUrl: string | null
  explanation: string
  credit: string | null
  alt: string | null
  sourceUrl: string
}

export interface ApodPage {
  items: ApodItem[]
  pagination: {
    page: number
    perPage: number
    totalItems: number | null
    totalPages: number | null
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
}

function safeUrl(value: string | undefined, allowedHosts: Set<string>): string | null {
  if (!value) return null

  try {
    const url = new URL(value)
    return url.protocol === 'https:' && allowedHosts.has(url.hostname) ? url.toString() : null
  } catch {
    return null
  }
}

function extractAttribute(html: string | undefined, tag: string, attribute: string): string | undefined {
  if (!html) return undefined
  const tagPattern = new RegExp(`<${tag}\\b[^>]*>`, 'i')
  const element = html.match(tagPattern)?.[0]
  if (!element) return undefined

  const attributePattern = new RegExp(`\\b${attribute}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i')
  const match = element.match(attributePattern)
  return match?.[1] ?? match?.[2]
}

function toPlainText(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: ['br'],
    allowedAttributes: {},
  })
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function parseIntegerHeader(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) return null
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) ? parsed : null
}

export function normalizeApodRecord(input: unknown): ApodItem {
  const parsed = rawApodRecordSchema.safeParse(input)
  if (!parsed.success) {
    throw new ApiError(502, 'NASA_INVALID_RESPONSE', 'NASA returned an unexpected APOD response.')
  }

  const record = parsed.data
  const sourceUrl = safeUrl(record.permalink, NASA_PAGE_HOSTS) ?? safeUrl(record.url, NASA_PAGE_HOSTS)
  if (!sourceUrl) {
    throw new ApiError(502, 'NASA_INVALID_RESPONSE', 'NASA returned an APOD item without a valid source link.')
  }

  const mediaType = record.media_type === 'image' || record.media_type === 'video'
    ? record.media_type
    : 'other'
  const previewImageUrl = safeUrl(record.hdurl, NASA_MEDIA_HOSTS)
    ?? safeUrl(extractAttribute(record.basic_html, 'img', 'src'), NASA_MEDIA_HOSTS)
  const mediaUrl = mediaType === 'video'
    ? safeUrl(extractAttribute(record.basic_html, 'source', 'src'), NASA_MEDIA_HOSTS)
      ?? safeUrl(extractAttribute(record.basic_html, 'video', 'src'), NASA_MEDIA_HOSTS)
    : mediaType === 'image'
      ? previewImageUrl
      : null

  return {
    date: record.date,
    title: record.title,
    mediaType,
    mediaUrl,
    previewImageUrl,
    explanation: toPlainText(record.explanation),
    credit: toPlainText(record.credit ?? record.copyright ?? '') || null,
    alt: record.alt?.trim() || null,
    sourceUrl,
  }
}

export function createApodService(
  fetcher: typeof fetch = fetch,
  cache: HttpCache<ApodPage> = new HttpCache<ApodPage>(CACHE_TTL_MS),
) {
  return {
    getPage({ page, perPage }: ApodQuery): Promise<ApodPage> {
      const cacheKey = `${page}:${perPage}`
      return cache.get(cacheKey, async () => {
        const url = new URL(APOD_ENDPOINT)
        url.searchParams.set('page', String(page))
        url.searchParams.set('per_page', String(perPage))

        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

        try {
          const response = await fetcher(url, {
            headers: { accept: 'application/json' },
            signal: controller.signal,
          })

          if (!response.ok) {
            throw new ApiError(502, 'NASA_UPSTREAM_ERROR', 'NASA APOD is temporarily unavailable.')
          }

          const payload: unknown = await response.json()
          if (!Array.isArray(payload)) {
            throw new ApiError(502, 'NASA_INVALID_RESPONSE', 'NASA returned an unexpected APOD response.')
          }

          const items = payload.map(normalizeApodRecord)
          const totalItems = parseIntegerHeader(response.headers.get('x-wp-total'))
          const totalPages = parseIntegerHeader(response.headers.get('x-wp-totalpages'))

          return {
            items,
            pagination: {
              page,
              perPage,
              totalItems,
              totalPages,
              hasPreviousPage: page > 1,
              hasNextPage: totalPages === null ? items.length === perPage : page < totalPages,
            },
          }
        } catch (error) {
          if (error instanceof ApiError) throw error
          if (controller.signal.aborted) {
            throw new ApiError(504, 'NASA_TIMEOUT', 'NASA APOD took too long to respond.')
          }
          throw new ApiError(502, 'NASA_UNAVAILABLE', 'NASA APOD is temporarily unavailable.')
        } finally {
          clearTimeout(timeout)
        }
      })
    },
  }
}

export const apodService = createApodService()
