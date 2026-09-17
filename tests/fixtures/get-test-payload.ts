import type { Payload } from 'payload'
import { getPayload } from 'payload'

import config from '../../payload.config.ts'
import { assertTestDatabase } from '../setup/assert-test-database.ts'

let cached: Promise<Payload> | undefined

/**
 * Memoiza una única instancia de Payload por proceso de prueba (no por
 * archivo de prueba) para no reabrir el pool de conexión en cada test -
 * ver design.md, Decisión 4.
 */
export function getTestPayload(): Promise<Payload> {
  assertTestDatabase(process.env.DATABASE_URI)

  if (!cached) {
    cached = getPayload({ config })
  }
  return cached
}
