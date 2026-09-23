import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access/roles.ts'
import { invalidateArticleSidebarCache } from '../hooks/shell/cache-invalidation.ts'

/**
 * Site-wide control for the Article page's sidebar (no per-Post override —
 * every article shares the same configuration). `postsPanel` is grouped
 * (rather than flat fields) so a future sibling group (e.g. `ads`) can be
 * added without restructuring this Global.
 */
export const ArticleSidebar: GlobalConfig = {
  slug: 'articleSidebar',
  label: 'Barra lateral de noticias',
  access: {
    read: () => true,
    update: isAdmin,
  },
  hooks: {
    afterChange: [invalidateArticleSidebarCache],
  },
  fields: [
    {
      name: 'postsPanel',
      label: 'Panel de noticias',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          label: 'Activado',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'mode',
          label: 'Modo',
          type: 'select',
          defaultValue: 'latest',
          options: [
            { label: 'Últimos posts', value: 'latest' },
            { label: 'Más nuevo por categoría', value: 'newest-per-category' },
            { label: 'Destacados', value: 'featured' },
          ],
        },
        {
          name: 'heading',
          label: 'Encabezado',
          type: 'text',
          admin: {
            description: 'Opcional — si se deja vacío, se usa un título automático según el modo elegido.',
          },
        },
        {
          name: 'limit',
          label: 'Límite',
          type: 'number',
          defaultValue: 5,
          min: 1,
          max: 10,
        },
      ],
    },
  ],
}
