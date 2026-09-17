import { expect, test } from './base-test'

import { FIXTURE } from './fixture-data'

/** Journey crítico: navegar a una Page publicada desde la navegación. */
test('navegar a una Page publicada desde la navegación', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: FIXTURE.pageTitle }).click()

  await expect(page).toHaveURL(`/${FIXTURE.pageSlug}`)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})
