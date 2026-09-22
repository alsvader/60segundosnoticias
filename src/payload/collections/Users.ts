import type { CollectionConfig } from 'payload'
import { Forbidden } from 'payload'

import { isAdmin, isAdminFieldAccess, isLoggedInFieldAccess } from '../access/roles.ts'
import { slugField } from '../fields/slug-field.ts'
import { socialLinksField } from '../fields/social-links-field.ts'
import { preventDeleteWithPosts } from '../hooks/users/prevent-delete-with-posts.ts'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Usuario',
    plural: 'Usuarios',
  },
  auth: true,
  admin: {
    useAsTitle: 'displayName',
  },
  access: {
    // Collection-level read stays open so the public author shape
    // (displayName/slug/avatar/bio/socialLinks) is readable; sensitive
    // fields below carry their own field-level access instead.
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeLogin: [
      ({ user }) => {
        if (user.active === false) {
          throw new Forbidden()
        }
      },
    ],
    beforeDelete: [preventDeleteWithPosts],
  },
  fields: [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
    },
    {
      name: 'displayName',
      label: 'Nombre público',
      type: 'text',
      required: true,
    },
    slugField({ collection: 'users', useAsSlug: 'displayName', required: false }),
    {
      name: 'avatar',
      label: 'Avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'bio',
      label: 'Biografía',
      type: 'textarea',
    },
    socialLinksField,
    // Merged with the field Payload's `auth: true` injects automatically;
    // this custom `access` overrides its (unset) default.
    {
      name: 'email',
      label: 'Correo electrónico',
      type: 'email',
      access: {
        read: isLoggedInFieldAccess,
      },
    },
    {
      name: 'role',
      label: 'Rol',
      type: 'select',
      required: true,
      defaultValue: 'writer',
      options: [
        { label: 'Administrador', value: 'admin' },
        { label: 'Redactor', value: 'writer' },
      ],
      access: {
        read: isLoggedInFieldAccess,
        update: isAdminFieldAccess,
      },
    },
    {
      name: 'active',
      label: 'Activo',
      type: 'checkbox',
      defaultValue: true,
      access: {
        read: isLoggedInFieldAccess,
      },
    },
  ],
}
