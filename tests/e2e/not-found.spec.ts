import { expect, test } from './base-test'

/** Journey crítico: una URL desconocida renderiza el 404 de marca. */
test('una URL desconocida renderiza el 404 de marca', async ({ page }) => {
  const response = await page.goto('/esta-url-no-existe-jamas-fixture')

  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'No encontramos esta página' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/')
})
