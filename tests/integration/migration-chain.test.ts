import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { getTestPayload } from '../fixtures/get-test-payload.ts'
import { runMigrationChain } from '../../scripts/run-migration-chain.ts'

/**
 * Cubre specs/cms-integration-testing/spec.md, requirement "La cadena de
 * migraciones produce un esquema operable". `runMigrationChain()` ya
 * corrió como parte de `pnpm test:integration` (ver package.json) antes
 * de que Vitest arranque, así que este archivo solo necesita volver a
 * invocarla para confirmar que es segura de re-ejecutar (idempotente) y
 * luego probar el smoke-read vía Local API.
 */
describe('cadena de migraciones', () => {
  beforeAll(async () => {
    await runMigrationChain()
  }, 120_000)

  it('deja un esquema en el que cada Collection/Global requerido es legible vía Local API', async () => {
    const payload = await getTestPayload()

    await expect(payload.findGlobal({ slug: 'navigation', overrideAccess: true })).resolves.toBeDefined()
    await expect(payload.findGlobal({ slug: 'footer', overrideAccess: true })).resolves.toBeDefined()
    await expect(payload.findGlobal({ slug: 'siteSettings', overrideAccess: true })).resolves.toBeDefined()
    await expect(payload.findGlobal({ slug: 'home', overrideAccess: true })).resolves.toBeDefined()

    await expect(payload.find({ collection: 'posts', limit: 1, overrideAccess: true })).resolves.toBeDefined()
    await expect(payload.find({ collection: 'pages', limit: 1, overrideAccess: true })).resolves.toBeDefined()
    await expect(payload.find({ collection: 'categories', limit: 1, overrideAccess: true })).resolves.toBeDefined()
    await expect(payload.find({ collection: 'search', limit: 1, overrideAccess: true })).resolves.toBeDefined()
    await expect(payload.find({ collection: 'redirects', limit: 1, overrideAccess: true })).resolves.toBeDefined()
  })
})

afterAll(async () => {
  const payload = await getTestPayload()
  await payload.destroy()
})
