/**
 * Siembra los fixtures base contra DATABASE_URI (debe ser la base de
 * pruebas) para que los journeys E2E tengan contenido determinista con
 * qué interactuar. Invocado como parte de `test:e2e:server` (ver
 * package.json), después de migrar y antes de `next build` - ver
 * design.md, Decisión 7.
 */
import { getPayload } from 'payload'

import config from '../payload.config.ts'
import { assertTestDatabase } from '../tests/setup/assert-test-database.ts'
import { seedBaseFixtures } from '../tests/fixtures/builders.ts'

assertTestDatabase(process.env.DATABASE_URI)

const payload = await getPayload({ config })
const fixtures = await seedBaseFixtures(payload)
console.log(
  `Fixtures E2E listos: admin=${fixtures.admin.email}, writerA=${fixtures.writerA.email}, ` +
    `writerB=${fixtures.writerB.email}, categorías=${fixtures.categories.map((c) => c.slug).join(',')}, ` +
    `post publicado=${fixtures.publishedPost.slug}, page=${fixtures.page.slug}`,
)
await payload.destroy()
process.exit(0)
