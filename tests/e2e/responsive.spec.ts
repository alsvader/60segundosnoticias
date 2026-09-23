import type { Locator, Page } from '@playwright/test'

import { expect, test } from './base-test'
import { FIXTURE } from './fixture-data'
import { expandHeaderSearch } from './helpers'

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

async function boxes(...locators: Locator[]) {
  return Promise.all(locators.map((locator) => locator.boundingBox()))
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

    // specs/site-shell/spec.md - expandir/colapsar HeaderSearch no desplaza
    // el logo ni la navegación principal (solo existe desde md en adelante).
    if (viewport.width >= 768) {
      test('HeaderSearch no desplaza logo ni navegación', async ({ page }) => {
        await page.goto('/')
        const nav = page.getByRole('navigation', { name: 'Principal' })
        const logo = page.getByRole('link', { name: /— inicio$/ })
        const before = await boxes(nav, logo)

        // Colapsado, la nav queda centrada entre logo y lupa (mismo reparto
        // que el justify-between original).
        const [navBox, logoBox] = before
        const searchButton = page.getByRole('button', { name: 'Buscar' })
        const buttonBox = await searchButton.boundingBox()
        const gapLeft = navBox!.x - (logoBox!.x + logoBox!.width)
        const gapRight = buttonBox!.x - (navBox!.x + navBox!.width)
        expect(Math.abs(gapLeft - gapRight)).toBeLessThanOrEqual(1)

        await expandHeaderSearch(page)
        expect(await boxes(nav, logo)).toEqual(before)

        // Expandido, el input cubre la nav completa y termina antes de la lupa.
        const inputBox = await page.getByLabel('Buscar en el sitio').first().boundingBox()
        expect(inputBox!.x).toBeLessThanOrEqual(navBox!.x)
        expect(inputBox!.x + inputBox!.width).toBeGreaterThanOrEqual(navBox!.x + navBox!.width)
        expect(inputBox!.x + inputBox!.width).toBeLessThanOrEqual(buttonBox!.x)

        await page.keyboard.press('Escape')
        await expect(searchButton).toHaveAttribute('aria-expanded', 'false')
        await expect.poll(() => boxes(nav, logo)).toEqual(before)

        // WCAG 2.4.11: salir del input hacia la nav (Shift+Tab) colapsa el
        // buscador, así el link enfocado nunca queda tapado por el input.
        await expandHeaderSearch(page)
        await page.keyboard.press('Shift+Tab')
        await expect(searchButton).toHaveAttribute('aria-expanded', 'false')
        await expect(nav.getByRole('link').last()).toBeFocused()
      })
    }
  })
}
