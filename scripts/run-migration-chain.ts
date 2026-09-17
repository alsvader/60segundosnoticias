/**
 * Ejecuta la cadena completa de migraciones versionadas de Payload contra
 * DATABASE_URI, y falla si el objetivo no es inequívocamente una base de
 * datos de pruebas.
 *
 * Reutilizado por:
 *   - `pnpm test:migrations` (invocación humana/CI directa)
 *   - `tests/integration/migration-chain.test.ts` (además hace el smoke
 *     read de colecciones/globals vía Local API)
 *
 * Ver openspec/changes/testing-qa-performance/design.md, Decisión 5: una
 * sola implementación de "correr la cadena de migraciones", nunca
 * `migrate:create` ni snapshots.
 *
 * IMPORTANTE (hallazgo de implementación, ver design.md § Riesgos): el
 * CLI de Payload (`payload migrate`, vía `tsx`) puede no terminar el
 * proceso incluso después de aplicar todas las migraciones
 * correctamente - confirmado empíricamente (0% CPU, conexión a la base
 * de datos ya establecida e inactiva, sin salida nueva, indefinidamente).
 * En vez de esperar a que el proceso hijo termine, esta función sondea
 * directamente `payload_migrations` - la fuente de verdad real en
 * Postgres - y termina el proceso hijo explícitamente en cuanto confirma
 * que todas las migraciones esperadas quedaron aplicadas.
 */
import { spawn } from 'node:child_process'
import { readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { Client } from 'pg'

import { assertTestDatabase } from '../tests/setup/assert-test-database.ts'

const MIGRATIONS_DIR = path.resolve(import.meta.dirname, '../src/payload/migrations')
const POLL_INTERVAL_MS = 500
// Generoso a propósito: una corrida en frío (caché de `tsx` vacía) puede
// tardar varios minutos - ver design.md.
const POLL_TIMEOUT_MS = 10 * 60 * 1000

function getExpectedMigrationNames(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.ts') && file !== 'index.ts')
    .map((file) => file.replace(/\.ts$/, ''))
}

async function getAppliedMigrationNames(databaseUri: string): Promise<Set<string>> {
  const client = new Client({ connectionString: databaseUri })
  await client.connect()
  try {
    const result = await client.query<{ name: string }>('select name from payload_migrations where batch >= 0')
    return new Set(result.rows.map((row) => row.name))
  } catch (error) {
    // La tabla `payload_migrations` todavía no existe: base de datos
    // completamente vacía, ninguna migración se ha aplicado aún.
    if ((error as { code?: string }).code === '42P01') {
      return new Set()
    }
    throw error
  } finally {
    await client.end()
  }
}

export async function runMigrationChain(): Promise<void> {
  const databaseUri = process.env.DATABASE_URI
  assertTestDatabase(databaseUri)

  const expected = getExpectedMigrationNames()

  const child = spawn('pnpm', ['exec', 'payload', 'migrate'], {
    detached: true,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' },
  })

  try {
    const start = Date.now()
    while (Date.now() - start < POLL_TIMEOUT_MS) {
      const applied = await getAppliedMigrationNames(databaseUri)
      if (expected.every((name) => applied.has(name))) {
        return
      }
      if (child.exitCode !== null && child.exitCode !== 0) {
        throw new Error(
          `"payload migrate" salió con código ${child.exitCode} antes de aplicar todas las migraciones`,
        )
      }
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
    }
    throw new Error(
      `Tiempo de espera agotado (${POLL_TIMEOUT_MS}ms) esperando que la cadena de migraciones se aplicara por completo`,
    )
  } finally {
    if (child.exitCode === null && child.pid) {
      // Grupo de procesos completo (pnpm -> node -> posible worker de
      // tsx), no solo el proceso de nivel superior - ver el comentario
      // de arriba.
      try {
        process.kill(-child.pid, 'SIGKILL')
      } catch {
        // El proceso ya terminó por su cuenta entre el último chequeo y
        // este punto - no es un error.
      }
    }
  }
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (invokedDirectly) {
  runMigrationChain()
    .then(() => {
      console.log('Cadena de migraciones aplicada completamente.')
      process.exit(0)
    })
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
