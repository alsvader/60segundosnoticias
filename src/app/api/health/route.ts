import { Pool } from 'pg'

import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'

const DB_CHECK_TIMEOUT_MS = 2000

async function checkDatabase(): Promise<boolean> {
  const pool = new Pool({
    connectionString: env.DATABASE_URI,
    connectionTimeoutMillis: DB_CHECK_TIMEOUT_MS,
  })

  try {
    await pool.query('SELECT 1')
    return true
  } catch {
    return false
  } finally {
    await pool.end().catch(() => undefined)
  }
}

export async function GET() {
  const databaseHealthy = await checkDatabase()
  const healthy = databaseHealthy

  return Response.json(
    {
      status: healthy ? 'ok' : 'degraded',
      database: databaseHealthy ? 'ok' : 'unreachable',
    },
    { status: healthy ? 200 : 503 },
  )
}
