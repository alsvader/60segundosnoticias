import type { Page } from '@playwright/test'

/**
 * Expande HeaderSearch y espera a que su transición CSS
 * (`--motion-normal`, 200ms) termine antes de devolver el control -
 * axe-core/`toHaveScreenshot()` capturan el estado intermedio de la
 * transición si se les deja correr inmediatamente después del click,
 * reportando el color de placeholder aún interpolando opacidad
 * (hallazgo real de tests/e2e/a11y.spec.ts, Fase 11).
 */
export async function expandHeaderSearch(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Buscar' }).click()
  const input = page.getByLabel('Buscar en el sitio').first()
  await input.waitFor({ state: 'visible' })
  await page.waitForTimeout(300)
}

/**
 * Abre MobileNav y espera a que termine la animación de entrada del Sheet
 * de Radix (`duration-200` en el panel, `duration-100` en el overlay)
 * antes de devolver el control - el mismo problema que
 * `expandHeaderSearch()`: escanear/capturar a mitad de una animación de
 * opacidad produce colores intermedios sin sentido (hallazgo real de
 * tests/e2e/a11y.spec.ts, Fase 11).
 */
export async function openMobileNav(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Abrir menú de navegación' }).click()
  await page.getByRole('navigation', { name: 'Navegación móvil' }).waitFor({ state: 'visible' })
  await page.waitForTimeout(300)
}
