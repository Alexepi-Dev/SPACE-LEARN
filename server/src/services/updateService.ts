import { Pool } from 'pg';
import type { UpdateInfo, UpdateStatus } from '../models/update.js';

export class UpdateService {
  private pool: Pool;

  constructor(databaseUrl: string) {
    this.pool = new Pool({ connectionString: databaseUrl });
  }

  async getCurrentVersion(): Promise<UpdateInfo | null> {
    const result = await this.pool.query<UpdateInfo>(
      `SELECT * FROM updates WHERE status = $1 ORDER BY version DESC LIMIT 1`,
      ['published'],
    );
    return result.rows[0] ?? null;
  }

  async getLatestVersion(): Promise<UpdateInfo | null> {
    // Same as current for now – can be extended to include prereleases
    return this.getCurrentVersion();
  }

  async getHistory(limit = 50): Promise<UpdateInfo[]> {
    const result = await this.pool.query<UpdateInfo>(
      `SELECT * FROM updates ORDER BY created_at DESC LIMIT $1`,
      [limit],
    );
    return result.rows;
  }

  async getByVersion(version: string): Promise<UpdateInfo | null> {
    const result = await this.pool.query<UpdateInfo>(
      `SELECT * FROM updates WHERE version = $1`,
      [version],
    );
    return result.rows[0] ?? null;
  }

  async create(update: Omit<UpdateInfo, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<UpdateInfo> {
    const result = await this.pool.query<UpdateInfo>(
      `INSERT INTO updates (version, title, description, changelog, fixes, improvements, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        update.version,
        update.title,
        update.description,
        update.changelog,
        update.fixes,
        update.improvements,
        'draft' as UpdateStatus,
      ],
    );
    return result.rows[0];
  }

  async update(id: string, patch: Partial<Omit<UpdateInfo, 'id' | 'created_at' | 'updated_at'>>): Promise<UpdateInfo> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const [key, value] of Object.entries(patch)) {
      fields.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }
    values.push(id);
    const sql = `UPDATE updates SET ${fields.join(', ')}, updated_at = now() WHERE id = $${idx} RETURNING *`;
    const result = await this.pool.query<UpdateInfo>(sql, values);
    return result.rows[0];
  }

  async setStatus(id: string, status: UpdateStatus, scheduledAt?: string): Promise<UpdateInfo> {
    const result = await this.pool.query<UpdateInfo>(
      `UPDATE updates SET status = $1, scheduled_at = $2, updated_at = now() WHERE id = $3 RETURNING *`,
      [status, scheduledAt ?? null, id],
    );
    return result.rows[0];
  }
}
