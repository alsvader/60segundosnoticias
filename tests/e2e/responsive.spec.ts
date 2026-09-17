import type { Page } from '@playwright/test'

import { expect, test } from './base-test'
import { FIXTURE } from './fixture-data'

/**
 * Cubre specs/quality-and-performance/spec.md - ausencia de scroll
 * horizontal en los breakpoints acordados, incluyendo los dos estados
 * interactivos (MobileNav abierto, HeaderSearch expandido).
 */
const VIEWPORTS = [
  { name: '375px', width: 375, height: 812 },
  { name: '768px', width: 768, height: 1024 },
  { name: '1024px', width: 1024, height: 768 },
  { name: '1440px', width: 1440, height: 900 },
]

const PAGES = [
  { name: 'Home', path: '/' },
  { name: 'Category', path: `/${FIXTURE.categorySlug}` },
  { name: 'Article', path: `/${FIXTURE.categorySlug}/${FIXTURE.postSlug}` },
  { name: 'Page', path: `/${FIXTURE.pageSlug}` },
  { name: 'Search', path: '/buscar?q=fixture' },
]

async function expectNoHorizontalScroll(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
}

for (const viewport of VIEWPORTS) {
  test.describe(`viewport ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })

    for (const pageDef of PAGES) {
      test(`${pageDef.name} sin scroll horizontal`, async ({ page }) => {
        await page.goto(pageDef.path)
        await expectNoHorizontalScroll(page)
      })
    }

    // El trigger de MobileNav es `md:hidden` (Header) - en 768px+ Tailwind
    // ya muestra la navegación de escritorio en su lugar, así que este
    // estado solo existe por debajo de ese breakpoint.
    if (viewport.width < 768) {
      test('MobileNav abierto sin scroll horizontal', async ({ page }) => {
        await page.goto('/')
        await page.getByRole('button', { name: 'Abrir menú de navegación' }).click()
        await expect(page.getByRole('navigation', { name: 'Navegación móvil' })).toBeVisible()
        await expectNoHorizontalScroll(page)
      })
    }

    test('HeaderSearch expandido sin scroll horizontal', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('button', { name: 'Buscar' }).click()
      await expect(page.getByLabel('Buscar en el sitio').first()).toBeVisible()
      await expectNoHorizontalScroll(page)
    })
  })
}
