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
  labels: {
    singular: 'Introducción editorial',
    plural: 'Introducciones editoriales',
  },
  interfaceName: 'EditorialIntroBlock',
  fields: [
    {
      name: 'headlinePrimary',
      label: 'Titular (parte principal)',
      type: 'text',
      required: true,
      admin: {
        description: 'Primera parte del titular (color tinta/negro). Ej.: "Noticias al".',
      },
    },
    {
      name: 'headlineAccent',
      label: 'Titular (parte destacada)',
      type: 'text',
      required: true,
      admin: {
        description: 'Segunda parte del titular (color rojo de marca). Ej.: "Momento".',
      },
    },
    { name: 'description', label: 'Descripción', type: 'textarea', required: true },
    {
      name: 'backgroundImage',
      label: 'Imagen de fondo',
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
      label: 'Imagen principal',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Imagen/gráfico prominente junto al texto, mostrado sobre la imagen de fondo.',
      },
    },
    {
      name: 'cta',
      label: 'Botón de llamada a la acción',
      type: 'group',
      fields: linkFields,
    },
  ],
}
