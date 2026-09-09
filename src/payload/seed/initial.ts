import { getPayload } from 'payload'

import config from '../../../payload.config.ts'
import type { CategoryIconKey } from '../../lib/constants/category-icon-keys.ts'
import type { CategoryThemeKey } from '../../lib/constants/category-theme-keys.ts'

/**
 * `seed:initial` - idempotent baseline data for a fresh environment.
 *
 * Scoped to what already has a schema in this phase: the initial
 * Categories. Navigation/Home/SiteSettings are Globals that do not exist
 * yet (later phases) and are deliberately NOT created or faked here.
 *
 * Safe to run repeatedly: each Category is looked up by `slug` before
 * creating it, so re-running never produces duplicates.
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

console.log('seed:initial done.')
process.exit(0)
