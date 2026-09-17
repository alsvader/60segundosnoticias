import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'

import { expect, test } from './base-test'
import { FIXTURE } from './fixture-data'
import { expandHeaderSearch, openMobileNav } from './helpers'

/**
 * Cubre specs/quality-and-performance/spec.md - escaneo automatizado de
 * accesibilidad sobre las páginas representativas + los dos estados
 * interactivos (MobileNav abierto, HeaderSearch expandido). Ninguna
 * violación automáticamente detectable SHALL pasar.
 */
async function expectNoViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
}

test('Home no tiene violaciones de accesibilidad automáticamente detectables', async ({ page }) => {
  await page.goto('/')
  await expectNoViolations(page)
})

test('Category no tiene violaciones de accesibilidad automáticamente detectables', async ({ page }) => {
  await page.goto(`/${FIXTURE.categorySlug}`)
  await expectNoViolations(page)
})

test('Article no tiene violaciones de accesibilidad automáticamente detectables', async ({ page }) => {
  await page.goto(`/${FIXTURE.categorySlug}/${FIXTURE.postSlug}`)
  await expectNoViolations(page)
})

test('Page no tiene violaciones de accesibilidad automáticamente detectables', async ({ page }) => {
  await page.goto(`/${FIXTURE.pageSlug}`)
  await expectNoViolations(page)
})

test('/buscar no tiene violaciones de accesibilidad automáticamente detectables', async ({ page }) => {
  await page.goto('/buscar?q=fixture')
  await expectNoViolations(page)
})

test('el 404 de marca no tiene violaciones de accesibilidad automáticamente detectables', async ({ page }) => {
  await page.goto('/esta-url-no-existe-jamas-fixture')
  await expectNoViolations(page)
})

test('MobileNav abierto no tiene violaciones de accesibilidad automáticamente detectables', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await openMobileNav(page)
  await expectNoViolations(page)
})

test('HeaderSearch expandido no tiene violaciones de accesibilidad automáticamente detectables', async ({ page }) => {
  await page.goto('/')
  await expandHeaderSearch(page)
  await expectNoViolations(page)
})
