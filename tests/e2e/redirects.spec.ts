import { expect, test } from './base-test'

import { FIXTURE } from './fixture-data'

/** Journey crítico: una URL legacy con slug histórico resuelve al destino canónico actual. */
test('una URL legacy resuelve al destino canónico actual', async ({ page }) => {
  const response = await page.goto(FIXTURE.legacyRedirectFrom)

  await expect(page).toHaveURL(`/${FIXTURE.categorySlug}/${FIXTURE.postSlug}`)
  expect(response?.status()).toBeLessThan(400)
  await expect(page.getByRole('heading', { name: FIXTURE.postTitle, level: 1 })).toBeVisible()
})
