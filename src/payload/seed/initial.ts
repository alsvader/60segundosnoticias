import { getPayload } from 'payload'

import config from '../../../payload.config.ts'
import type { CategoryIconKey } from '../../lib/constants/category-icon-keys.ts'
import type { CategoryThemeKey } from '../../lib/constants/category-theme-keys.ts'

/**
 * `seed:initial` - idempotent baseline data for a fresh environment.
 *
 * Creates the initial Categories and, since its schema now exists, a
 * minimal baseline `Home` layout. `Navigation`/`SiteSettings` are Globals
 * with existing schema too, but seeding them is not this phase's
 * responsibility and is deliberately left alone here.
 *
 * Safe to run repeatedly: each Category is looked up by `slug` before
 * creating it, and the `Home` layout is only ever set once (never
 * overwritten if already non-empty - including a real Admin's own
 * configuration), so re-running never produces duplicates or clobbers
 * editorial work.
 */

type InitialCategory = {
  colorTheme: CategoryThemeKey
  icon: CategoryIconKey
  name: string
  slug: string
}

const INITIAL_CATEGORIES: InitialCategory[] = [
  { colorTheme: 'red', icon: 'newspaper', name: 'Noticias', slug: 'noticias' },
  { colorTheme: 'blue', icon: 'video', name: 'Vlog', slug: 'vlog' },
  { colorTheme: 'orange', icon: 'plane', name: 'Experiencias', slug: 'experiencias' },
  { colorTheme: 'green', icon: 'star', name: 'Recomendaciones', slug: 'recomendaciones' },
  { colorTheme: 'purple', icon: 'popcorn', name: 'Entretenimiento', slug: 'entretenimiento' },
]

const payload = await getPayload({ config })

for (const category of INITIAL_CATEGORIES) {
  const existing = await payload.find({
    collection: 'categories',
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: category.slug } },
  })

  if (existing.docs.length > 0) {
    console.log(`skip (already exists): ${category.slug}`)
    continue
  }

  await payload.create({
    collection: 'categories',
    data: category,
    overrideAccess: true,
  })
  console.log(`created: ${category.slug}`)
}

const home = await payload.findGlobal({ slug: 'home', depth: 0, overrideAccess: true })

if (!home.layout || home.layout.length === 0) {
  const categoryDocs = await payload.find({
    collection: 'categories',
    where: { slug: { in: INITIAL_CATEGORIES.map((category) => category.slug) } },
    limit: INITIAL_CATEGORIES.length,
    overrideAccess: true,
  })

  await payload.updateGlobal({
    slug: 'home',
    data: {
      layout: [
        {
          blockType: 'categoryExplorer',
          title: 'Explora nuestras secciones',
          categories: categoryDocs.docs.map((category) => category.id),
          showViewAll: false,
        },
      ],
      _status: 'published',
    },
    overrideAccess: true,
  })
  console.log('created: Home baseline (CategoryExplorer)')
} else {
  console.log('skip (already exists): Home layout')
}

console.log('seed:initial done.')
process.exit(0)
