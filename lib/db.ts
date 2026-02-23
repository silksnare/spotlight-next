import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL ??
  `postgresql://${process.env.DB_USER ?? 'dbmasteruser'}:${encodeURIComponent(process.env.DB_PASSWORD ?? '')}@${process.env.DB_HOST ?? 'ls-4979b66437c22f1e22f5872e7e8538a81d9a1bab.c3cwakey6k0o.us-east-2.rds.amazonaws.com'}:${process.env.DB_PORT ?? '5432'}/${process.env.DB_NAME ?? 'spotlight'}`

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

let schemaEnsured = false

export async function ensureAuthSupportTables() {
  if (schemaEnsured) return

  await pool.query(`
    CREATE TABLE IF NOT EXISTS login_failures (
      user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      failed_attempts INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `)

  schemaEnsured = true
}
