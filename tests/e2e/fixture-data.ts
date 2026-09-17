/**
 * Valores deterministas que produce `tests/fixtures/builders.ts` -
 * sembrados una vez por `scripts/seed-e2e.ts` antes de que Playwright
 * arranque (ver design.md, Decisión 7). Centralizados aquí para no
 * repetir estas cadenas mágicas en cada spec.
 */
export const FIXTURE = {
  categorySlug: 'fixture-noticias',
  categoryName: 'Fixture Noticias',
  secondCategorySlug: 'fixture-vlog',
  postSlug: 'fixture-post-publicado',
  postTitle: 'Post publicado de fixture',
  pageSlug: 'fixture-page',
  pageTitle: 'Página de fixture',
  legacyRedirectFrom: '/fixture-noticias/legacy-slug-fixture',
  adminEmail: 'fixture.admin@example.test',
  writerAEmail: 'fixture.writer-a@example.test',
  password: 'TestOnlyFixturePass123!',
} as const
