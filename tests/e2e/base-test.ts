import { test as base, expect } from '@playwright/test'

/**
 * Ninguno de los journeys críticos SHALL depender de la disponibilidad de
 * un proveedor externo de embeds - se bloquea la red hacia estos dominios
 * en cada test (design.md, Decisión 9). El Article con embeds usado por
 * el audit de Lighthouse (Fase 8.5) es la única excepción deliberada, y
 * no usa este archivo.
 */
const BLOCKED_THIRD_PARTY_HOSTS = [
  /youtube(-nocookie)?\.com/,
  /ytimg\.com/,
  /instagram\.com/,
  /tiktok\.com/,
  /facebook\.com/,
  /facebook\.net/,
  /(twitter|x)\.com/,
  /linkedin\.com/,
]

function isBlockedThirdPartyUrl(url: string): boolean {
  return BLOCKED_THIRD_PARTY_HOSTS.some((pattern) => pattern.test(url))
}

export const test = base.extend({
  // Renombrado de `use` (el nombre convencional de Playwright para este
  // callback) a `runTest`: eslint-plugin-react-hooks lo confunde con el
  // hook `use()` de React por el nombre, no por lo que hace.
  page: async ({ page }, runTest) => {
    await page.route('**/*', async (route) => {
      if (isBlockedThirdPartyUrl(route.request().url())) {
        await route.abort()
        return
      }
      await route.continue()
    })
    await runTest(page)
  },
})

export { expect }
