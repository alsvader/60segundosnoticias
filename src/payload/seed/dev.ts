import path from 'node:path'

import { getPayload } from 'payload'

import config from '../../../payload.config.ts'
import type { Post } from '../../payload-types.ts'

/**
 * `seed:dev` - development/demo content only. Never invoke this from
 * application startup or a production deploy; it is meant to be run
 * explicitly by a developer against a local database.
 */

const DEV_PASSWORD = 'DevOnlyPass123!'

const payload = await getPayload({ config })

const findOrCreateWriter = async (email: string, displayName: string) => {
  const existing = await payload.find({
    collection: 'users',
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: email } },
  })
  if (existing.docs.length > 0) {
    return existing.docs[0]
  }
  const created = await payload.create({
    collection: 'users',
    data: { active: true, displayName, email, password: DEV_PASSWORD, role: 'writer' },
    overrideAccess: true,
  })
  console.log(`created writer: ${email}`)
  return created
}

const writerOne = await findOrCreateWriter('writer.uno@example.dev', 'Writer Uno (dev)')
await findOrCreateWriter('writer.dos@example.dev', 'Writer Dos (dev)')

const existingMedia = await payload.find({
  collection: 'media',
  limit: 1,
  overrideAccess: true,
  where: { alt: { equals: 'Imagen de prueba (dev seed)' } },
})
const media =
  existingMedia.docs[0] ??
  (await payload.create({
    collection: 'media',
    data: { alt: 'Imagen de prueba (dev seed)' },
    filePath: path.resolve(process.cwd(), 'public/textures/paper-grain.webp'),
    overrideAccess: true,
    user: writerOne,
  }))
if (!existingMedia.docs[0]) {
  console.log('created dev Media')
}

const categories = await payload.find({ collection: 'categories', limit: 1, overrideAccess: true })
const primaryCategory = categories.docs[0]
if (!primaryCategory) {
  console.log('no Category found - run `pnpm seed:initial` first for a fully realistic published example.')
}

const richText = (text: string) => ({
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        version: 1,
        children: [{ type: 'text', text, version: 1 }],
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

const upsertPost = async (slug: string, title: string, data: Partial<Post>) => {
  const existing = await payload.find({
    collection: 'posts',
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: slug } },
  })
  if (existing.docs.length > 0) {
    console.log(`skip (already exists): post ${slug}`)
    return existing.docs[0]
  }
  const created = await payload.create({
    collection: 'posts',
    data: { slug, title, ...data },
    overrideAccess: true,
  })
  console.log(`created post: ${slug}`)
  return created
}

await upsertPost('borrador-de-prueba-dev', 'Borrador de prueba (dev)', {
  author: writerOne.id,
  content: richText('Este es un borrador de ejemplo generado por seed:dev.'),
})

if (primaryCategory) {
  await upsertPost('noticia-de-prueba-dev', 'Noticia de prueba (dev)', {
    _status: 'published',
    author: writerOne.id,
    content: richText(
      'Este es un artículo de ejemplo publicado por seed:dev, con suficiente contenido para calcular un reading time real.',
    ),
    excerpt: 'Un resumen de ejemplo para la noticia de prueba de desarrollo.',
    featuredImage: media.id,
    primaryCategory: primaryCategory.id,
  })
}

const existingPage = await payload.find({
  collection: 'pages',
  limit: 1,
  overrideAccess: true,
  where: { slug: { equals: 'pagina-de-prueba-dev' } },
})
if (existingPage.docs.length === 0) {
  await payload.create({
    collection: 'pages',
    data: { slug: 'pagina-de-prueba-dev', title: 'Página de prueba (dev)' },
    overrideAccess: true,
  })
  console.log('created dev Page')
} else {
  console.log('skip (already exists): page pagina-de-prueba-dev')
}

console.log('seed:dev done.')
process.exit(0)
