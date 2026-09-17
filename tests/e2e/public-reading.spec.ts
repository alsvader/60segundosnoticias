import { expect, test } from './base-test'

import { FIXTURE } from './fixture-data'

/** Journey crítico: Home -> Category -> Article. */
test('Home -> Category -> Article', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('header')).toBeVisible()

  await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: FIXTURE.categoryName }).click()
  await expect(page).toHaveURL(`/${FIXTURE.categorySlug}`)

  await page.getByRole('link', { name: FIXTURE.postTitle }).click()
  await expect(page).toHaveURL(`/${FIXTURE.categorySlug}/${FIXTURE.postSlug}`)
  await expect(page.getByRole('heading', { name: FIXTURE.postTitle, level: 1 })).toBeVisible()
})
