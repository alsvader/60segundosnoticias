import type { CollectionConfig } from 'payload'

import { CATEGORY_ICON_KEYS, type CategoryIconKey } from '../../lib/constants/category-icon-keys.ts'
import { CATEGORY_THEME_KEYS, type CategoryThemeKey } from '../../lib/constants/category-theme-keys.ts'
import { isAdmin } from '../access/roles.ts'
import { seoFields } from '../fields/seo-fields.ts'
import { slugField } from '../fields/slug-field.ts'
import { invalidateCategoryCache, invalidateCategoryCacheOnDelete } from '../hooks/categories/cache-invalidation.ts'
import { preventDeleteWithPosts } from '../hooks/categories/prevent-delete-with-posts.ts'
import { createCategoryRedirect } from '../hooks/categories/redirect-lifecycle.ts'

// Labels del admin por clave; los `value` persistidos siguen siendo las claves.
const THEME_LABELS: Record<CategoryThemeKey, string> = {
  red: 'Rojo',
  blue: 'Azul',
  orange: 'Naranja',
  green: 'Verde',
  pink: 'Rosa',
  purple: 'Morado',
  cyan: 'Cian',
  yellow: 'Amarillo',
  teal: 'Verde azulado',
  indigo: 'Índigo',
}

const ICON_LABELS: Record<CategoryIconKey, string> = {
  newspaper: 'Periódico',
  video: 'Video',
  plane: 'Avión',
  star: 'Estrella',
  popcorn: 'Palomitas',
  dots: 'Puntos',
}

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Categoría',
    plural: 'Categorías',
  },
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeDelete: [preventDeleteWithPosts],
    afterChange: [invalidateCategoryCache, createCategoryRedirect],
    afterDelete: [invalidateCategoryCacheOnDelete],
  },
  fields: [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      required: true,
      unique: true,
    },
    slugField({ collection: 'categories', useAsSlug: 'name', namespaceCollection: 'pages' }),
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea',
    },
    {
      name: 'colorTheme',
      label: 'Tema de color',
      type: 'select',
      options: CATEGORY_THEME_KEYS.map((value) => ({ label: THEME_LABELS[value], value })),
    },
    {
      name: 'icon',
      label: 'Ícono',
      type: 'select',
      options: CATEGORY_ICON_KEYS.map((value) => ({ label: ICON_LABELS[value], value })),
    },
    {
      name: 'image',
      label: 'Imagen',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'showInNavigation',
      label: 'Mostrar en navegación',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'showOnHome',
      label: 'Mostrar en portada',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'order',
      label: 'Orden',
      type: 'number',
    },
    seoFields,
  ],
}
