type QueryResult = {
  rows: any[]
  rowCount: number
}

type PoolClient = {
  query: (text: string, params?: any[]) => Promise<QueryResult>
  release: () => void
}

type Queryable = {
  query: (text: string, params?: any[]) => Promise<QueryResult>
  connect: () => Promise<PoolClient>
}

const connectionString = process.env.DATABASE_URL ??
  `postgresql://${process.env.DB_USER ?? 'dbmasteruser'}:${encodeURIComponent(process.env.DB_PASSWORD ?? '')}@${process.env.DB_HOST ?? 'ls-4979b66437c22f1e22f5872e7e8538a81d9a1bab.c3cwakey6k0o.us-east-2.rds.amazonaws.com'}:${process.env.DB_PORT ?? '5432'}/${process.env.DB_NAME ?? 'spotlight'}`

let cachedPool: Queryable | null = null

async function loadPool(): Promise<Queryable> {
  if (cachedPool) {
    return cachedPool
  }

  try {
    const req = new Function('return require')() as NodeRequire
    const pg = req('pg') as {
      Pool: new (config: { connectionString: string, ssl: { rejectUnauthorized: boolean } }) => Queryable
    }

    cachedPool = new pg.Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    })

    return cachedPool
  } catch {
    throw new Error('Database driver "pg" is not available. Install dependencies before using database-backed routes.')
  }
}

export const pool: Queryable = {
  async query(text: string, params?: any[]) {
    const db = await loadPool()
    return db.query(text, params)
  },
  async connect() {
    const db = await loadPool()
    return db.connect()
  },
}

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
