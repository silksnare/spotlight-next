import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var dbMigrated: boolean | undefined;
}

// Reuse pool across hot reloads in development
const pool =
  global.pgPool ??
  new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== 'production') {
  global.pgPool = pool;
}

/**
 * Adds columns needed for login-attempt tracking if they don't already exist.
 * Safe to call multiple times — uses IF NOT EXISTS.
 */
export async function ensureSchema(): Promise<void> {
  if (global.dbMigrated) return;

  await pool.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS failed_login_attempts INT NOT NULL DEFAULT 0;
  `);

  global.dbMigrated = true;
}

export default pool;
