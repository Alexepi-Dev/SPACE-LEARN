import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { Pool } from 'pg'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL must be set before running database migrations.')
}

const migrationsDirectory = fileURLToPath(new URL('../migrations/', import.meta.url))
const migrationFiles = (await readdir(migrationsDirectory))
  .filter((file) => file.endsWith('.sql'))
  .sort()
const pool = new Pool({ connectionString: databaseUrl, max: 1, connectionTimeoutMillis: 5_000 })

try {
  for (const migrationFile of migrationFiles) {
    const migration = await readFile(new URL(`../migrations/${migrationFile}`, import.meta.url), 'utf8')
    await pool.query(migration)
    console.info(`Database migration completed: ${migrationFile}`)
  }
} finally {
  await pool.end()
}
