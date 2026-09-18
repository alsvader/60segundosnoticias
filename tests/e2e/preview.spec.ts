import { expect, test } from './base-test'

import { FIXTURE } from './fixture-data'

const DRAFT_SLUG = 'fixture-post-borrador'

/** Journey crítico: sesión autenticada de editor -> previsualizar borrador -> salir de preview y confirmar vista pública restaurada. */
test('previsualizar un borrador y salir restaura la vista pública @smoke-cross-browser', async ({ page, browserName }) => {
  // WebKit sobre http://localhost, no un defecto de producción - ver
  // design.md, Risks. Draft Mode de Next.js fija su cookie con
  // `Secure: true` + `SameSite: 'none'` en cualquier build de producción
  // (`draft-mode-provider.js`, no algo que este proyecto controle);
  // Chromium/Firefox tratan `http://localhost` como origen confiable para
  // esa cookie, WebKit nunca extendió esa excepción al atributo `Secure`.
  // En producción real (HTTPS) la cookie es válida en los tres navegadores.
  test.skip(
    browserName === 'webkit',
    'Next.js Draft Mode usa cookies Secure+SameSite=None en producción; WebKit no las acepta sobre HTTP en localhost. Producción corre sobre HTTPS.',
  )

  // El borrador nunca es público - confirmado antes de autenticar nada.
  const anonymousResponse = await page.goto(`/${FIXTURE.categorySlug}/${DRAFT_SLUG}`)
  expect(anonymousResponse?.status()).toBe(404)

  const loginResponse = await page.request.post('/api/users/login', {
    data: { email: FIXTURE.writerAEmail, password: FIXTURE.password },
  })
  expect(loginResponse.ok()).toBe(true)

  const postsResponse = await page.request.get(
    `/api/posts?where[slug][equals]=${DRAFT_SLUG}&depth=0&draft=true`,
  )
  const { docs } = await postsResponse.json()
  const draftPostId = docs[0]?.id
  expect(draftPostId).toBeDefined()

  const previewSecret = process.env.PREVIEW_SECRET
  expect(previewSecret).toBeTruthy()

  await page.goto(`/api/preview?secret=${previewSecret}&collection=posts&id=${draftPostId}`)

  await expect(page).toHaveURL(`/${FIXTURE.categorySlug}/${DRAFT_SLUG}`)
  await expect(page.getByRole('heading', { name: 'Post en borrador de fixture', level: 1 })).toBeVisible()

  await page.goto('/api/preview-exit')
  await expect(page).toHaveURL('/')

  const restoredPublicResponse = await page.goto(`/${FIXTURE.categorySlug}/${DRAFT_SLUG}`)
  expect(restoredPublicResponse?.status()).toBe(404)
})
