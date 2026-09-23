import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/roles.ts'

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  labels: {
    singular: 'Redirección',
    plural: 'Redirecciones',
  },
  admin: {
    useAsTitle: 'from',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'from',
      label: 'Desde (ruta de origen)',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'to',
      label: 'Hacia (destino)',
      type: 'text',
      required: true,
    },
    {
      name: 'statusCode',
      label: 'Código de estado',
      type: 'select',
      defaultValue: '301',
      options: [
        { label: '301 (Permanente)', value: '301' },
        { label: '302 (Temporal)', value: '302' },
      ],
    },
    {
      name: 'active',
      label: 'Activa',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  // No hooks here: no automatic creation/modification of Redirects from
  // other Collections in this phase - see specs/redirects-collection/spec.md.
}
