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

  // `GIT_SHA` se lee directo de `process.env` (igual que
  // `src/app/api/preview/route.ts`/`src/lib/security/headers.ts`), nunca
  // vía `src/lib/env`: agregarlo al esquema zod ahí exigiría la variable
  // también en dev/test, donde no existe (openspec/changes/
  // production-deployment-dokploy). Sin cache: un despliegue necesita
  // poder confirmar, sondeando esta ruta, que el SHA nuevo ya está vivo -
  // una respuesta cacheada por un proxy intermedio invalidaría esa señal.
  return Response.json(
    {
      status: healthy ? 'ok' : 'degraded',
      database: databaseHealthy ? 'ok' : 'unreachable',
      sha: process.env.GIT_SHA ?? null,
    },
    {
      status: healthy ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    },
  )
}
