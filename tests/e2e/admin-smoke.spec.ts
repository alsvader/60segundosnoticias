import { expect, test } from './base-test'

import { FIXTURE } from './fixture-data'

/** Journey crítico: login de Admin -> colección core alcanzable (sin automatizar CRUD completo de Payload). */
test('un Admin puede iniciar sesión y alcanzar la colección de Posts', async ({ page }) => {
  await page.goto('/admin/login')

  await page.getByLabel('Email').fill(FIXTURE.adminEmail)
  await page.getByLabel('Password').fill(FIXTURE.password)
  await page.getByRole('button', { name: 'Login' }).click()

  await expect(page).toHaveURL(/\/admin(\/)?$/)

  await page.goto('/admin/collections/posts')
  await expect(page.getByRole('link', { name: FIXTURE.postTitle })).toBeVisible()
})
