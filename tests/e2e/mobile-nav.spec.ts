import { expect, test } from './base-test'

import { FIXTURE } from './fixture-data'

// Ancho suficiente para activar el breakpoint `md:hidden`/`md:block` que
// decide MobileNav vs. navegación de escritorio - deliberadamente no se usa
// `devices['iPhone 13']` (emulación de dispositivo completa): la versión de
// Chromium instalada rechaza uno de sus overrides de CDP
// (`Page.overrideSetting: PushAPIEnabled`), y el journey solo necesita el
// viewport angosto, no touch/user-agent móvil real.
test.use({ viewport: { width: 375, height: 812 } })

/** Journey crítico: abrir MobileNav en viewport móvil, navegar a Category -> Article. */
test('MobileNav abierto navega a Category -> Article', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Abrir menú de navegación' }).click()

  const nav = page.getByRole('navigation', { name: 'Navegación móvil' })
  await expect(nav).toBeVisible()

  await nav.getByRole('link', { name: FIXTURE.categoryName }).click()
  await expect(page).toHaveURL(`/${FIXTURE.categorySlug}`)

  await page.getByRole('link', { name: FIXTURE.postTitle }).click()
  await expect(page).toHaveURL(`/${FIXTURE.categorySlug}/${FIXTURE.postSlug}`)
})
