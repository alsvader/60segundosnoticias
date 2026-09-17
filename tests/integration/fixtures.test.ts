import { afterAll, describe, expect, it } from 'vitest'

import { getTestPayload } from '../fixtures/get-test-payload.ts'
import { seedBaseFixtures } from '../fixtures/builders.ts'

describe('seedBaseFixtures', () => {
  it('provee, sin configuración adicional, un Admin, al menos dos Writers, categorías, un Post publicado, un Post en borrador y una Page listos para usarse', async () => {
    const payload = await getTestPayload()
    const fixtures = await seedBaseFixtures(payload)

    expect(fixtures.admin.role).toBe('admin')
    expect(fixtures.writerA.role).toBe('writer')
    expect(fixtures.writerB.role).toBe('writer')
    expect(fixtures.writerA.id).not.toBe(fixtures.writerB.id)
    expect(fixtures.categories.length).toBeGreaterThanOrEqual(2)
    expect(fixtures.publishedPost._status).toBe('published')
    expect(fixtures.draftPost._status).toBe('draft')
    expect(fixtures.page.slug).toBe('fixture-page')
  })
})

afterAll(async () => {
  const payload = await getTestPayload()
  await payload.destroy()
})
