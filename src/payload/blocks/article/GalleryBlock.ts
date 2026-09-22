import type { Block } from 'payload'

export const GalleryBlock: Block = {
  slug: 'galleryBlock',
  labels: {
    singular: 'Galería',
    plural: 'Galerías',
  },
  interfaceName: 'GalleryBlock',
  fields: [
    {
      name: 'images',
      label: 'Imágenes',
      labels: { singular: 'Imagen', plural: 'Imágenes' },
      type: 'array',
      required: true,
      minRows: 2,
      fields: [
        {
          name: 'image',
          label: 'Imagen',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          label: 'Pie de foto',
          type: 'text',
        },
      ],
    },
    {
      name: 'layout',
      label: 'Diseño',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Cuadrícula', value: 'grid' },
        { label: 'Carrusel', value: 'carousel' },
      ],
    },
  ],
}
