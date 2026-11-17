import serverless from 'serverless-http';
import { createApp } from '../../server/dist/app.js';

const config = {
  allowedOrigins: ['*'],
  nodeEnv: process.env.NODE_ENV ?? 'production',
  port: 3001,
  // Placeholder DB URL for demo; replace with real DB in production
  databaseUrl:
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/space_learn',
  deeplAuthKey: process.env.DEEPL_AUTH_KEY,
  deeplApiUrl:
    process.env.DEEPL_API_URL ?? 'https://api-free.deepl.com/v2/translate',
  nasaApiKey: process.env.NASA_API_KEY,
  adminEmail: process.env.ADMIN_EMAIL ?? 'alexvegbe@gmail.com',
  adminPasswordHash:
    process.env.ADMIN_PASSWORD_HASH ??
    'scrypt$hv0Ci0iz9wS3A65omMZ7pA$AHQrUDFq8UiWO2-AEhIi0ydcMZYNn9oouJA34LmHNbtXsoIetWrznDo71r2Pbd3YPI48RSO5HnE8LLIi98q6hg',
  adminSessionSecret:
    process.env.ADMIN_SESSION_SECRET ??
    'dFiXcdS0NPpoxs16ePF7s064cyIWdyOjyLb63Hcdwo0rIH98K7ZrakNcxBNMavu_',
};

const app = createApp(config);

export const handler = serverless(app);
