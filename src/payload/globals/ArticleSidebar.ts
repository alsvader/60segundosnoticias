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
      type: 'group',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'mode',
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
          type: 'text',
          admin: {
            description: 'Opcional — si se deja vacío, se usa un título automático según el modo elegido.',
          },
        },
        {
          name: 'limit',
          type: 'number',
          defaultValue: 5,
          min: 1,
          max: 10,
        },
      ],
    },
  ],
}
