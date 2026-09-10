import type { Block } from 'payload'

import { linkFields } from '../../fields/link-fields.ts'

/**
 * Introductory editorial composition (Home Block V1 #8, approved during
 * manual visual review — docs/60-segundos-spec.md §19.2). Does not depend
 * on a Post (unlike HeroNews) and is not secondary/promotional content
 * (unlike Banner). `cta` reuses the same Navigation/Footer link-item
 * model (`linkFields`) - a single-entry group, not an array, but the
 * same Category/Page/External shape and resolver.
 */
export const EditorialIntro: Block = {
  slug: 'editorialIntro',
  interfaceName: 'EditorialIntroBlock',
  fields: [
    {
      name: 'headlinePrimary',
      type: 'text',
      required: true,
      admin: {
        description: 'Primera parte del titular (color tinta/negro). Ej.: "Noticias al".',
      },
    },
    {
      name: 'headlineAccent',
      type: 'text',
      required: true,
      admin: {
        description: 'Segunda parte del titular (color rojo de marca). Ej.: "Momento".',
      },
    },
    { name: 'description', type: 'textarea', required: true },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description:
          'Composición visual de fondo completa (puede incluir mapa, collage editorial u otros elementos decorativos como una sola imagen preparada).',
      },
    },
    {
      name: 'foregroundImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Imagen/gráfico prominente junto al texto, renderizado sobre backgroundImage.',
      },
    },
    {
      name: 'cta',
      type: 'group',
      fields: linkFields,
    },
  ],
}
