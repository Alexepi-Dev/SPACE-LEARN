import 'dotenv/config'

export interface ServerConfig {
  port: number
  nodeEnv: string
  allowedOrigins: string[]
  nasaApiKey?: string
  databaseUrl?: string
  adminEmail?: string
  adminPasswordHash?: string
  adminSessionSecret?: string
  deeplAuthKey?: string
  deeplApiUrl: string
}

function parseAllowedOrigins(value: string | undefined): string[] {
  if (!value?.trim()) {
    throw new Error('CLIENT_ORIGIN must contain at least one allowed origin.')
  }

  return value.split(',').map((entry) => {
    const candidate = entry.trim()
    let url: URL

    try {
      url = new URL(candidate)
    } catch {
      throw new Error('CLIENT_ORIGIN must contain valid HTTP or HTTPS origins.')
    }

    if (
      !['http:', 'https:'].includes(url.protocol)
      || url.username
      || url.password
      || url.pathname !== '/'
      || url.search
      || url.hash
    ) {
      throw new Error('CLIENT_ORIGIN must contain valid HTTP or HTTPS origins.')
    }

    return url.origin
  })
}

export function loadServerConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const port = Number(env.PORT ?? 3001)
  const adminSessionSecret = env.ADMIN_SESSION_SECRET?.trim() || undefined
  const databaseUrl = env.DATABASE_URL?.trim() || undefined
  const adminEmail = env.ADMIN_EMAIL?.trim().toLowerCase() || undefined
  const adminPasswordHash = env.ADMIN_PASSWORD_HASH?.trim() || undefined
  const deeplAuthKey = env.DEEPL_AUTH_KEY?.trim() || undefined
  const deeplApiUrl = env.DEEPL_API_URL?.trim() || 'https://api-free.deepl.com/v2/translate'
  const administratorValues = [adminEmail, adminPasswordHash, adminSessionSecret]
  const administratorValuesProvided = administratorValues.filter(Boolean).length

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.')
  }
  if (adminSessionSecret && Buffer.byteLength(adminSessionSecret) < 32) {
    throw new Error('ADMIN_SESSION_SECRET must contain at least 32 bytes.')
  }
  if (administratorValuesProvided > 0 && administratorValuesProvided < administratorValues.length) {
    throw new Error('ADMIN_EMAIL, ADMIN_PASSWORD_HASH, and ADMIN_SESSION_SECRET must be configured together.')
  }
  if (administratorValuesProvided === administratorValues.length && !databaseUrl) {
    throw new Error('DATABASE_URL is required when administrator access is configured.')
  }
  if (adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
    throw new Error('ADMIN_EMAIL must be a valid email address.')
  }
  if (adminPasswordHash && !/^scrypt\$[A-Za-z0-9_-]{22}\$[A-Za-z0-9_-]{86}$/.test(adminPasswordHash)) {
    throw new Error('ADMIN_PASSWORD_HASH must be generated with the admin:hash command.')
  }
  if (databaseUrl) {
    let parsedDatabaseUrl: URL
    try {
      parsedDatabaseUrl = new URL(databaseUrl)
    } catch {
      throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL.')
    }
    if (parsedDatabaseUrl.protocol !== 'postgres:' && parsedDatabaseUrl.protocol !== 'postgresql:') {
      throw new Error('DATABASE_URL must use the PostgreSQL protocol.')
    }
  }
  let parsedDeepLApiUrl: URL
  try {
    parsedDeepLApiUrl = new URL(deeplApiUrl)
  } catch {
    throw new Error('DEEPL_API_URL must be a valid DeepL API URL.')
  }
  if (
    parsedDeepLApiUrl.protocol !== 'https:'
    || !['api-free.deepl.com', 'api.deepl.com'].includes(parsedDeepLApiUrl.hostname)
    || parsedDeepLApiUrl.pathname !== '/v2/translate'
    || parsedDeepLApiUrl.username
    || parsedDeepLApiUrl.password
    || parsedDeepLApiUrl.port
    || parsedDeepLApiUrl.search
    || parsedDeepLApiUrl.hash
  ) {
    throw new Error('DEEPL_API_URL must use the official DeepL translate endpoint.')
  }

  return {
    port,
    nodeEnv: env.NODE_ENV ?? 'development',
    allowedOrigins: parseAllowedOrigins(env.CLIENT_ORIGIN),
    nasaApiKey: env.NASA_API_KEY?.trim() || undefined,
    databaseUrl,
    adminEmail,
    adminPasswordHash,
    adminSessionSecret,
    deeplAuthKey,
    deeplApiUrl,
  }
}
