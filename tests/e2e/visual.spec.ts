import { expect, test } from './base-test'
import { FIXTURE } from './fixture-data'

/**
 * Cubre specs/quality-and-performance/spec.md - regresión visual con
 * `toHaveScreenshot()` (Playwright nativo, sin Percy/Chromatic - decisión
 * ratificada) sobre las 4 superficies acordadas. No enmascara ninguna
 * fecha: `ArticleMetadata.publishedAtLabel` es una etiqueta ya formateada
 * por la capa de datos a partir de un `publishedAt` fijo del fixture (ver
 * 7.2), nunca una hora relativa ("hace N horas") calculada en el momento
 * de la corrida - es determinista por diseño.
 */

test('Home (desktop)', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveScreenshot('home-desktop.png', {
    fullPage: true,
  })
})

test('Article (desktop)', async ({ page }) => {
  await page.goto(`/${FIXTURE.categorySlug}/${FIXTURE.postSlug}`)
  await expect(page).toHaveScreenshot('article-desktop.png', {
    fullPage: true,
  })
})

test('HeaderSearch expandido (desktop)', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Buscar' }).click()
  await expect(page.getByLabel('Buscar en el sitio').first()).toBeVisible()
  await expect(page.locator('header')).toHaveScreenshot('header-search-expanded-desktop.png')
})

test('HeaderSearch expandido (tablet)', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Buscar' }).click()
  await expect(page.getByLabel('Buscar en el sitio').first()).toBeVisible()
  await expect(page.locator('header')).toHaveScreenshot('header-search-expanded-tablet.png')
})

test('MobileNav abierto (~375px)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Abrir menú de navegación' }).click()
  await expect(page.getByRole('navigation', { name: 'Navegación móvil' })).toBeVisible()
  await expect(page).toHaveScreenshot('mobile-nav-open.png')
})
