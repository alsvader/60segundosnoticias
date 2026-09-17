#!/usr/bin/env node
/**
 * Comando único usado por `webServer.command` de Playwright (ver
 * design.md, Decisión 7): migra -> siembra fixtures -> build de
 * producción -> arranca el standalone de Next.js (`node server.js`,
 * exactamente igual que el stage `runner` del Dockerfile - no `next
 * start`, que Next.js reporta explícitamente como incompatible con
 * `output: standalone`), sirviendo en el puerto 3100 (distinto del 3000
 * de desarrollo) para no chocar con un `pnpm dev`/`docker compose up`
 * local en ejecución.
 *
 * Requiere que `docker compose -f compose.test.yml up -d` ya esté
 * corriendo (Postgres de pruebas Y MinIO) antes de invocar este script.
 *
 * S3/MinIO: cualquier build de producción real (`output: standalone`)
 * fuerza `NODE_ENV=production` en el `server.js` generado, sin
 * excepción posible desde este script - `src/lib/env/index.ts` exige
 * entonces las seis variables `S3_*` reales. Por eso, a diferencia de
 * las pruebas de integración (que sí usan el fallback a almacenamiento
 * local), el entorno E2E completo - siembra incluida, para que los
 * archivos que el servidor servirá ya existan en el mismo bucket -
 * apunta al MinIO desechable de `compose.test.yml`. Ver
 * openspec/changes/testing-qa-performance/design.md, Decisión 3
 * (revisada).
 *
 * Variables de entorno explícitas en cada paso, nunca dependiendo de que
 * el build/arranque de producción auto-carguen un archivo .env por su
 * cuenta - Next.js fuerza NODE_ENV=production para esos comandos sin
 * importar lo que se le pase, así que su propia convención de carga de
 * .env.* no es fiable aquí (ver design.md, Decisión 4 y sus riesgos).
 */
import { cpSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

process.loadEnvFile(path.resolve(process.cwd(), '.env.test'))

const E2E_PORT = '3100'
const e2eEnv = {
  ...process.env,
  NEXT_PUBLIC_SITE_URL: `http://localhost:${E2E_PORT}`,
  S3_ENDPOINT: 'http://localhost:9000',
  S3_REGION: 'us-east-1',
  S3_BUCKET: 'e2e-test-media',
  S3_ACCESS_KEY_ID: 'e2eminioadmin',
  S3_SECRET_ACCESS_KEY: 'e2eminioadmin',
  S3_PUBLIC_URL: 'http://localhost:9000/e2e-test-media',
  PORT: E2E_PORT,
  HOSTNAME: '0.0.0.0',
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', env: e2eEnv })
  if (result.error) {
    throw result.error
  }
  if (result.status !== 0) {
    throw new Error(`"${command} ${args.join(' ')}" salió con código ${result.status}`)
  }
}

const scriptsDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptsDir, '..')
const standaloneDir = path.join(projectRoot, '.next', 'standalone')

run('node', [path.join(scriptsDir, 'run-migration-chain.ts')])
run('pnpm', ['exec', 'payload', 'run', path.join(scriptsDir, 'seed-e2e.ts')])
run('pnpm', ['build'])

// Mismo paso de empaquetado que el stage `runner` del Dockerfile: el
// standalone de Next.js no incluye `.next/static` ni `public/` por sí
// solo (limitación documentada de Next.js), hay que copiarlos junto al
// `server.js` generado.
if (!existsSync(standaloneDir)) {
  throw new Error(`No se encontró ${standaloneDir} - ¿"output: standalone" sigue configurado en next.config.ts?`)
}
cpSync(path.join(projectRoot, '.next', 'static'), path.join(standaloneDir, '.next', 'static'), { recursive: true })
cpSync(path.join(projectRoot, 'public'), path.join(standaloneDir, 'public'), { recursive: true })

run('node', [path.join(standaloneDir, 'server.js')])
