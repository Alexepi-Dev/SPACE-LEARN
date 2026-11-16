import serverless from 'serverless-http'
import { createApp } from '../../server/dist/app.js'

const config = {
  allowedOrigins: ['*'],
  nodeEnv: process.env.NODE_ENV ?? 'production',
  port: 3001,
  databaseUrl: process.env.DATABASE_URL,
  deeplAuthKey: process.env.DEEPL_AUTH_KEY,
  deeplApiUrl: process.env.DEEPL_API_URL ?? 'https://api-free.deepl.com/v2/translate',
  nasaApiKey: process.env.NASA_API_KEY,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH,
  adminSessionSecret: process.env.ADMIN_SESSION_SECRET,
}

const app = createApp(config)

export const handler = serverless(app)
