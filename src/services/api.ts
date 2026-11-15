import { z } from 'zod'

const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
})

export class ApiRequestError extends Error {
  readonly code: string
  readonly status?: number

  constructor(
    code: string,
    message: string,
    status?: number,
  ) {
    super(message)
    this.name = 'ApiRequestError'
    this.code = code
    this.status = status
  }
}

function getApiUrl(path: string): URL {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  const baseUrlValue = configuredBaseUrl || (import.meta.env.DEV ? window.location.origin : undefined)
  if (!baseUrlValue) {
    throw new ApiRequestError('API_NOT_CONFIGURED', 'The API server URL is not configured.')
  }

  try {
    const baseUrl = new URL(baseUrlValue)
    if (
      !['http:', 'https:'].includes(baseUrl.protocol)
      || baseUrl.pathname !== '/'
      || baseUrl.search
      || baseUrl.hash
    ) {
      throw new Error('Invalid API base URL.')
    }
    return new URL(path, baseUrl)
  } catch {
    throw new ApiRequestError('API_NOT_CONFIGURED', 'The API server URL is not configured correctly.')
  }
}

export async function apiGet<T>(
  path: string,
  schema: z.ZodType<T>,
  signal?: AbortSignal,
  headers: Record<string, string> = {},
): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    method: 'GET',
    headers: { accept: 'application/json', ...headers },
    signal,
  })

  return parseApiResponse(response, schema)
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  schema: z.ZodType<T>,
  headers: Record<string, string> = {},
): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })

  return parseApiResponse(response, schema)
}

async function parseApiResponse<T>(response: Response, schema: z.ZodType<T>): Promise<T> {
  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new ApiRequestError('INVALID_RESPONSE', 'The API returned an invalid response.', response.status)
  }

  if (!response.ok) {
    const error = errorResponseSchema.safeParse(payload)
    throw new ApiRequestError(
      error.success ? error.data.error.code : 'REQUEST_FAILED',
      error.success ? error.data.error.message : 'The request could not be completed.',
      response.status,
    )
  }

  const result = schema.safeParse(payload)
  if (!result.success) {
    throw new ApiRequestError('INVALID_RESPONSE', 'The API returned an unexpected response.', response.status)
  }

  return result.data
}
