import { expect, test } from './base-test'

import { FIXTURE } from './fixture-data'

/** Journey crítico: expandir HeaderSearch, enviar consulta, navegar a /buscar. */
test('expandir HeaderSearch y buscar navega a resultados en /buscar @smoke-cross-browser', async ({ page }) => {
  await page.goto('/')

  const searchButton = page.getByRole('button', { name: 'Buscar' })
  await searchButton.click()

  const searchInput = page.getByLabel('Buscar en el sitio').first()
  await expect(searchInput).toBeVisible()
  await searchInput.fill('fixture')
  await searchInput.press('Enter')

  await expect(page).toHaveURL(/\/buscar\?q=fixture/)
  await expect(page.getByRole('link', { name: FIXTURE.postTitle })).toBeVisible()
})

test('/buscar sin coincidencias no rompe la página', async ({ page }) => {
  await page.goto('/buscar?q=terminoquenuncaaparece12345')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})
