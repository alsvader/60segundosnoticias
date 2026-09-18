import path from 'node:path'

import type { Payload } from 'payload'

import type { Category, Media, Page, Post, Redirect } from '../../src/payload-types.ts'
import { getPostUrl } from '../../src/lib/url/canonical.ts'

/**
 * Builders de fixtures deterministas y reutilizables para integración y
 * E2E. Nunca usan credenciales reales - ver
 * openspec/changes/testing-qa-performance/specs/test-infrastructure/spec.md,
 * requirement "Fixtures de prueba deterministas".
 */

export const TEST_PASSWORD = 'TestOnlyFixturePass123!'

export type BaseFixtures = {
  admin: Awaited<ReturnType<typeof createAdmin>>
  writerA: Awaited<ReturnType<typeof createWriter>>
  writerB: Awaited<ReturnType<typeof createWriter>>
  media: Media
  categories: Category[]
  publishedPost: Post
  draftPost: Post
  /** Article adicional con un `EmbedBlock` (TikTok) en su contenido - openspec/changes/testing-qa-performance, tarea 8.3 (Lighthouse necesita un Article representativo con embed, reportado como diagnóstico, no como gate - ver lighthouserc.json). */
  embedPost: Post
  page: Page
  /** URL legacy (no reescrita a mano) con un redirect 301 real hacia `publishedPost`, para tests/e2e/redirects.spec.ts. */
  legacyRedirectFrom: string
}

const richText = (paragraphs: string[]) => ({
  root: {
    type: 'root',
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      version: 1,
      children: [{ type: 'text', text, version: 1 }],
    })),
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

/**
 * Igual que `richText`, pero inserta un nodo `EmbedBlock` (TikTok, un
 * provider soportado por `src/components/content/blocks/tiktok-embed.tsx`)
 * entre los párrafos - forma de nodo verificada contra
 * `@payloadcms/richtext-lexical`, `features/blocks/server/nodes/
 * BlocksNode.d.ts` (`SerializedBlockNode`): un nodo `block` hijo directo de
 * `root`, nunca anidado dentro de un párrafo.
 */
const richTextWithEmbed = (paragraphs: string[], embedUrl: string) => ({
  root: {
    type: 'root',
    children: [
      ...paragraphs.map((text) => ({
        type: 'paragraph',
        version: 1,
        children: [{ type: 'text', text, version: 1 }],
      })),
      {
        type: 'block',
        format: '',
        version: 2,
        fields: {
          id: 'fixture-embed-block',
          blockName: '',
          blockType: 'embedBlock',
          provider: 'tiktok',
          url: embedUrl,
          alignment: 'left',
        },
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

async function findOrCreateUser(
  payload: Payload,
  email: string,
  data: { displayName: string; role: 'admin' | 'writer' },
) {
  const existing = await payload.find({
    collection: 'users',
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: email } },
  })
  if (existing.docs[0]) {
    return existing.docs[0]
  }
  return payload.create({
    collection: 'users',
    data: { active: true, email, password: TEST_PASSWORD, ...data },
    overrideAccess: true,
  })
}

export function createAdmin(payload: Payload) {
  return findOrCreateUser(payload, 'fixture.admin@example.test', {
    displayName: 'Fixture Admin',
    role: 'admin',
  })
}

export function createWriter(payload: Payload, key: 'a' | 'b') {
  return findOrCreateUser(payload, `fixture.writer-${key}@example.test`, {
    displayName: `Fixture Writer ${key.toUpperCase()}`,
    role: 'writer',
  })
}

export async function createMedia(payload: Payload, uploadedBy: number): Promise<Media> {
  const existing = await payload.find({
    collection: 'media',
    limit: 1,
    overrideAccess: true,
    where: { alt: { equals: 'Imagen de fixture (Fase 11)' } },
  })
  if (existing.docs[0]) {
    return existing.docs[0] as Media
  }
  return (await payload.create({
    collection: 'media',
    data: { alt: 'Imagen de fixture (Fase 11)' },
    filePath: path.resolve(process.cwd(), 'public/textures/paper-grain.webp'),
    overrideAccess: true,
    user: uploadedBy,
  })) as Media
}

const FIXTURE_CATEGORIES = [
  { colorTheme: 'red' as const, icon: 'newspaper' as const, name: 'Fixture Noticias', slug: 'fixture-noticias' },
  { colorTheme: 'blue' as const, icon: 'video' as const, name: 'Fixture Vlog', slug: 'fixture-vlog' },
]

export async function createCategories(payload: Payload): Promise<Category[]> {
  const created: Category[] = []
  for (const category of FIXTURE_CATEGORIES) {
    const existing = await payload.find({
      collection: 'categories',
      limit: 1,
      overrideAccess: true,
      where: { slug: { equals: category.slug } },
    })
    created.push(existing.docs[0] ?? (await payload.create({ collection: 'categories', data: category, overrideAccess: true })))
  }
  return created
}

async function findExistingPost(payload: Payload, slug: string): Promise<Post | undefined> {
  const existing = await payload.find({
    collection: 'posts',
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: slug } },
  })
  return existing.docs[0] as Post | undefined
}

export async function createPublishedPost(
  payload: Payload,
  options: { author: number; category: number; featuredImage: number },
): Promise<Post> {
  const existing = await findExistingPost(payload, 'fixture-post-publicado')
  if (existing) {
    return existing
  }
  return payload.create({
    collection: 'posts',
    data: {
      _status: 'published',
      author: options.author,
      content: richText(['Contenido fijo del fixture de Post publicado, usado por pruebas de integración y E2E.']),
      excerpt: 'Excerpt fijo del fixture de Post publicado.',
      featuredImage: options.featuredImage,
      primaryCategory: options.category,
      publishedAt: '2026-01-01T12:00:00.000Z',
      slug: 'fixture-post-publicado',
      title: 'Post publicado de fixture',
    },
    overrideAccess: true,
  })
}

export async function createEmbedPost(
  payload: Payload,
  options: { author: number; category: number; featuredImage: number },
): Promise<Post> {
  const existing = await findExistingPost(payload, 'fixture-post-embed')
  if (existing) {
    return existing
  }
  return payload.create({
    collection: 'posts',
    data: {
      _status: 'published',
      author: options.author,
      content: richTextWithEmbed(
        ['Contenido fijo del fixture de Post con embed, usado por Lighthouse (diagnóstico, no gate) y pruebas E2E.'],
        'https://www.tiktok.com/@fixture/video/1234567890123456789',
      ),
      excerpt: 'Excerpt fijo del fixture de Post con embed.',
      featuredImage: options.featuredImage,
      primaryCategory: options.category,
      publishedAt: '2026-01-01T12:00:00.000Z',
      slug: 'fixture-post-embed',
      title: 'Post con embed de fixture',
    },
    overrideAccess: true,
  })
}

export async function createDraftPost(
  payload: Payload,
  options: { author: number; category: number },
): Promise<Post> {
  const existing = await findExistingPost(payload, 'fixture-post-borrador')
  if (existing) {
    return existing
  }
  return payload.create({
    collection: 'posts',
    data: {
      author: options.author,
      content: richText(['Contenido fijo del fixture de Post en borrador - nunca debe ser público.']),
      primaryCategory: options.category,
      slug: 'fixture-post-borrador',
      title: 'Post en borrador de fixture',
    },
    draft: true,
    overrideAccess: true,
  })
}

/**
 * `layout` con un Hero + un RichText - "bloques típicos" para que
 * Lighthouse (openspec/changes/testing-qa-performance, tarea 8.3) mida una
 * Page representativa, no una página vacía con solo un título.
 */
export async function createPage(payload: Payload, media: Media): Promise<Page> {
  const existing = await payload.find({
    collection: 'pages',
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: 'fixture-page' } },
  })
  if (existing.docs[0]) {
    return existing.docs[0] as Page
  }
  return (await payload.create({
    collection: 'pages',
    data: {
      _status: 'published',
      slug: 'fixture-page',
      title: 'Página de fixture',
      layout: [
        {
          blockType: 'hero',
          title: 'Página de fixture',
          description: 'Página de contenido estático usada por pruebas E2E y Lighthouse.',
          image: media.id,
          alignment: 'left',
        },
        {
          blockType: 'richText',
          content: richText(['Contenido fijo de la Page de fixture, representativo para medir Lighthouse.']),
        },
      ],
    },
    overrideAccess: true,
  })) as Page
}

/**
 * Redirect histórico fijo hacia `publishedPost`, usado por
 * tests/e2e/redirects.spec.ts (URL legacy -> destino canónico actual).
 * Nunca se genera vía el hook real de Posts (que exige un cambio de
 * slug/categoría) - se crea directamente, igual que
 * `createPublishedPost()`/`createPage()` crean su propio contenido fijo.
 */
export async function createLegacyRedirect(payload: Payload, publishedPost: Post, category: Category): Promise<Redirect> {
  const from = '/fixture-noticias/legacy-slug-fixture'
  const to = getPostUrl(category.slug, publishedPost.slug)

  const existing = await payload.find({
    collection: 'redirects',
    limit: 1,
    overrideAccess: true,
    where: { from: { equals: from } },
  })
  if (existing.docs[0]) {
    return existing.docs[0]
  }
  return payload.create({
    collection: 'redirects',
    data: { from, to, active: true, statusCode: '301' },
    overrideAccess: true,
  })
}

/**
 * Configura una base mínima de Navigation/SiteSettings para que los
 * journeys E2E (MobileNav, metadata de SEO) tengan algo determinista con
 * qué interactuar, sin sobreescribir una configuración de Admin ya
 * existente.
 */
export async function configureShellGlobals(payload: Payload, categories: Category[], page: Page): Promise<void> {
  const navigation = await payload.findGlobal({ slug: 'navigation', depth: 0, overrideAccess: true })
  if (!navigation.items || navigation.items.length === 0) {
    await payload.updateGlobal({
      slug: 'navigation',
      data: {
        items: [
          ...categories.map((category) => ({
            label: category.name,
            type: 'category' as const,
            category: category.id,
          })),
          { label: page.title, type: 'page' as const, page: page.id },
        ],
      },
      overrideAccess: true,
    })
  }

  const siteSettings = await payload.findGlobal({ slug: 'siteSettings', depth: 0, overrideAccess: true })
  if (!siteSettings.branding?.siteName) {
    await payload.updateGlobal({
      slug: 'siteSettings',
      data: {
        branding: { siteName: '60 Segundos Noticias (fixture)' },
        // Sin esto, Home/Category (sin meta description propia) no tienen
        // fallback y Lighthouse falla el audit `meta-description` -
        // openspec/changes/testing-qa-performance, tarea 8.4.
        seo: { defaultMetaDescription: 'Portal editorial y multimedia 60 Segundos Noticias (fixture de pruebas).' },
      },
      overrideAccess: true,
    })
  }
}

/**
 * Home con bloques poblados (EditorialIntro, HeroNews, LatestPosts,
 * PostsByCategory) usando únicamente contenido de fixtures - openspec/
 * changes/testing-qa-performance, tarea 8.3. Mismo patrón idempotente que
 * `src/payload/seed/dev.ts` (marcador fijo por bloque, nunca sobreescribe
 * un Home ya configurado por seed:initial o por un Admin real).
 */
export async function configureHomeBlocks(
  payload: Payload,
  options: { media: Media; categories: Category[]; publishedPost: Post; embedPost: Post },
): Promise<void> {
  const home = await payload.findGlobal({ slug: 'home', depth: 0, overrideAccess: true })
  const existingLayout = home.layout ?? []
  const newBlocks: NonNullable<typeof home.layout> = []

  const EDITORIAL_INTRO_HEADLINE = 'Fixture'
  if (!existingLayout.some((block) => block.blockType === 'editorialIntro' && block.headlinePrimary === EDITORIAL_INTRO_HEADLINE)) {
    newBlocks.push({
      blockType: 'editorialIntro',
      headlinePrimary: EDITORIAL_INTRO_HEADLINE,
      headlineAccent: 'Home',
      description: 'Home de fixture, usado por Lighthouse y pruebas E2E.',
      backgroundImage: options.media.id,
      foregroundImage: options.media.id,
      cta: { label: 'Ver últimas noticias', type: 'external', url: 'http://localhost:3000/' },
    })
  }

  if (!existingLayout.some((block) => block.blockType === 'heroNews')) {
    newBlocks.push({
      blockType: 'heroNews',
      eyebrow: 'Fixture',
      headline: options.publishedPost.title,
      contentMode: 'manual',
      mainPost: options.publishedPost.id,
      secondaryPosts: [options.embedPost.id],
    })
  }

  const LATEST_POSTS_TITLE = 'Últimas noticias (fixture)'
  if (!existingLayout.some((block) => block.blockType === 'latestPosts' && block.title === LATEST_POSTS_TITLE)) {
    newBlocks.push({ blockType: 'latestPosts', title: LATEST_POSTS_TITLE, limit: 6, layout: 'grid' })
  }

  const POSTS_BY_CATEGORY_TITLE = options.categories[0].name
  if (!existingLayout.some((block) => block.blockType === 'postsByCategory' && block.title === POSTS_BY_CATEGORY_TITLE)) {
    newBlocks.push({
      blockType: 'postsByCategory',
      title: POSTS_BY_CATEGORY_TITLE,
      category: options.categories[0].id,
      limit: 6,
      layout: 'grid',
      showViewAll: false,
    })
  }

  if (newBlocks.length > 0) {
    await payload.updateGlobal({
      slug: 'home',
      data: { layout: [...existingLayout, ...newBlocks], _status: 'published' },
      overrideAccess: true,
    })
  }
}

export async function seedBaseFixtures(payload: Payload): Promise<BaseFixtures> {
  const admin = await createAdmin(payload)
  const writerA = await createWriter(payload, 'a')
  const writerB = await createWriter(payload, 'b')
  const media = await createMedia(payload, writerA.id)
  const categories = await createCategories(payload)
  const publishedPost = await createPublishedPost(payload, {
    author: writerA.id,
    category: categories[0].id,
    featuredImage: media.id,
  })
  const embedPost = await createEmbedPost(payload, {
    author: writerA.id,
    category: categories[0].id,
    featuredImage: media.id,
  })
  const draftPost = await createDraftPost(payload, { author: writerA.id, category: categories[0].id })
  const page = await createPage(payload, media)
  await configureShellGlobals(payload, categories, page)
  await configureHomeBlocks(payload, { media, categories, publishedPost, embedPost })
  const legacyRedirect = await createLegacyRedirect(payload, publishedPost, categories[0])

  return {
    admin,
    writerA,
    writerB,
    media,
    categories,
    publishedPost,
    draftPost,
    embedPost,
    page,
    legacyRedirectFrom: legacyRedirect.from,
  }
}
