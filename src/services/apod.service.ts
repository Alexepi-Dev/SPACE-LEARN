import { z } from 'zod'
import { apiGet } from './api'

const apodItemSchema = z.object({
  date: z.string(),
  title: z.string(),
  mediaType: z.enum(['image', 'video', 'other']),
  mediaUrl: z.string().url().nullable(),
  previewImageUrl: z.string().url().nullable(),
  explanation: z.string(),
  credit: z.string().nullable(),
  alt: z.string().nullable(),
  sourceUrl: z.string().url(),
  frenchTranslation: z.object({
    title: z.string(),
    explanation: z.string(),
    alt: z.string().nullable(),
  }).nullable().optional().default(null),
  translationStatus: z.enum(['not_requested', 'translated', 'not_configured', 'unavailable']).optional().default('not_requested'),
})

const apodPageSchema = z.object({
  items: z.array(apodItemSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    perPage: z.number().int().positive(),
    totalItems: z.number().int().nonnegative().nullable(),
    totalPages: z.number().int().nonnegative().nullable(),
    hasPreviousPage: z.boolean(),
    hasNextPage: z.boolean(),
  }),
})

export type ApodItem = z.infer<typeof apodItemSchema>
export type ApodPage = z.infer<typeof apodPageSchema>

export async function getApodPage(
  page: number,
  perPage: number,
  language: 'en' | 'fr',
  signal?: AbortSignal,
): Promise<ApodPage> {
  const search = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  })
  return apiGet(`/api/space/apod?${search.toString()}`, apodPageSchema, signal, {
    'accept-language': language,
  })
}
