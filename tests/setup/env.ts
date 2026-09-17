/**
 * Único punto de entrada permitido para fijar el entorno de pruebas antes
 * de que cualquier archivo importe `payload.config.ts` (que lee
 * `DATABASE_URI` en tiempo de import). Cargado por Vitest (`setupFiles`,
 * ver vitest.config.ts) y por el `globalSetup` de Playwright
 * (tests/e2e/global-setup.ts).
 *
 * Ver openspec/changes/testing-qa-performance/design.md, Decisión 4.
 */
import path from 'node:path'

import { assertTestDatabase } from './assert-test-database'

const envTestPath = path.resolve(process.cwd(), '.env.test')

try {
  process.loadEnvFile(envTestPath)
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
    throw error
  }
  // Ya cargado por el proceso padre (p. ej. Playwright globalSetup ya
  // corrió en el mismo proceso) o variables provistas externamente por CI.
}

// Falla rápido y explícito si, por cualquier motivo, DATABASE_URI no
// apunta a la base de datos de pruebas al momento en que se carga este
// archivo - antes de que cualquier código de la aplicación pueda usarlo.
assertTestDatabase(process.env.DATABASE_URI)
