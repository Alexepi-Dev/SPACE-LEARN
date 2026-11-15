import { Pool } from 'pg'

export interface AdminAuditEntry {
  action: string
  resource: string
  result: 'success' | 'failure'
  occurredAt: string
}

let pool: Pool | undefined

export function getAdminDatabasePool(databaseUrl: string): Pool {
  pool ??= new Pool({
    connectionString: databaseUrl,
    max: 5,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
  })
  return pool
}

export async function checkAdminDatabase(databaseUrl: string): Promise<void> {
  await getAdminDatabasePool(databaseUrl).query('SELECT 1')
}

export async function recordAdminLogin(
  databaseUrl: string,
  actor: string,
  result: AdminAuditEntry['result'],
): Promise<void> {
  await getAdminDatabasePool(databaseUrl).query(
    `INSERT INTO admin_audit_logs (actor, actor_role, action, resource, result)
     VALUES ($1, $2, 'admin_login', '/api/admin/session', $3)`,
    [actor, result === 'success' ? 'superadmin' : 'unauthenticated', result],
  )
}

export async function recordAdminAction(
  databaseUrl: string,
  actor: string,
  action: string,
  resource: string,
): Promise<void> {
  await getAdminDatabasePool(databaseUrl).query(
    `INSERT INTO admin_audit_logs (actor, actor_role, action, resource, result)
     VALUES ($1, 'superadmin', $2, $3, 'success')`,
    [actor, action, resource],
  )
}

export async function getAdminAuditLog(databaseUrl: string): Promise<AdminAuditEntry[]> {
  const result = await getAdminDatabasePool(databaseUrl).query<{
    action: string
    resource: string
    result: 'success' | 'failure'
    occurred_at: Date
  }>(
    `SELECT action, resource, result, occurred_at
     FROM admin_audit_logs
     ORDER BY occurred_at DESC
     LIMIT 50`,
  )

  return result.rows.map((row) => ({
    action: row.action,
    resource: row.resource,
    result: row.result,
    occurredAt: row.occurred_at.toISOString(),
  }))
}
