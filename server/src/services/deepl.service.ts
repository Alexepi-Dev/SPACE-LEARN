import { createHash } from 'node:crypto'
import { z } from 'zod'
import { ApiError } from '../middleware/apiError.js'
import { HttpCache } from './httpCache.js'

const DEFAULT_DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate'
const REQUEST_TIMEOUT_MS = 10_000
const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const MAX_TEXTS_PER_REQUEST = 50
const MAX_REQUEST_TEXT_BYTES = 30_000

const translationResponseSchema = z.object({
  translations: z.array(z.object({
    text: z.string(),
  })),
})

export interface DeepLConfig {
  authKey?: string
  apiUrl?: string
}

export interface DeepLTranslator {
  readonly isConfigured: boolean
  translate(texts: string[]): Promise<string[]>
}

function splitIntoBatches(texts: string[]): string[][] {
  const batches: string[][] = []
  let batch: string[] = []
  let batchBytes = 0

  for (const text of texts) {
    const textBytes = Buffer.byteLength(text, 'utf8')
    if (textBytes > MAX_REQUEST_TEXT_BYTES) {
      throw new ApiError(502, 'DEEPL_TEXT_TOO_LARGE', 'An APOD text is too large to translate.')
    }

    if (
      batch.length > 0
      && (batch.length >= MAX_TEXTS_PER_REQUEST || batchBytes + textBytes > MAX_REQUEST_TEXT_BYTES)
    ) {
      batches.push(batch)
      batch = []
      batchBytes = 0
    }

    batch.push(text)
    batchBytes += textBytes
  }

  if (batch.length > 0) batches.push(batch)
  return batches
}

export function createDeepLTranslator(
  config: DeepLConfig,
  fetcher: typeof fetch = fetch,
  cache: HttpCache<string[]> = new HttpCache<string[]>(CACHE_TTL_MS, 100),
): DeepLTranslator {
  const authKey = config.authKey?.trim() || undefined
  const apiUrl = config.apiUrl?.trim() || DEFAULT_DEEPL_API_URL

  return {
    isConfigured: Boolean(authKey),
    async translate(texts) {
      if (!authKey) {
        throw new ApiError(503, 'DEEPL_NOT_CONFIGURED', 'French APOD translation is not configured.')
      }

      const cacheKey = createHash('sha256').update(JSON.stringify(texts)).digest('hex')
      return cache.get(cacheKey, async () => {
        const batches = splitIntoBatches(texts)
        const translated: string[] = []

        for (const batch of batches) {
          const body = new URLSearchParams()
          body.set('source_lang', 'EN')
          body.set('target_lang', 'FR')
          body.set('preserve_formatting', '1')
          for (const text of batch) body.append('text', text)

          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

          try {
            const response = await fetcher(apiUrl, {
              method: 'POST',
              headers: {
                accept: 'application/json',
                authorization: `DeepL-Auth-Key ${authKey}`,
                'content-type': 'application/x-www-form-urlencoded',
              },
              body,
              signal: controller.signal,
            })

            if (!response.ok) {
              throw new ApiError(502, 'DEEPL_UPSTREAM_ERROR', 'DeepL could not translate the NASA text.')
            }

            let payload: unknown
            try {
              payload = await response.json()
            } catch {
              throw new ApiError(502, 'DEEPL_INVALID_RESPONSE', 'DeepL returned an invalid response.')
            }

            const parsed = translationResponseSchema.safeParse(payload)
            if (!parsed.success || parsed.data.translations.length !== batch.length) {
              throw new ApiError(502, 'DEEPL_INVALID_RESPONSE', 'DeepL returned an unexpected translation response.')
            }
            translated.push(...parsed.data.translations.map((entry) => entry.text))
          } catch (error) {
            if (error instanceof ApiError) throw error
            if (controller.signal.aborted) {
              throw new ApiError(504, 'DEEPL_TIMEOUT', 'DeepL took too long to translate the NASA text.')
            }
            throw new ApiError(502, 'DEEPL_UNAVAILABLE', 'DeepL is temporarily unavailable.')
          } finally {
            clearTimeout(timeout)
          }
        }

        return translated
      })
    },
  }
}
