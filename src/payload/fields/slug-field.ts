import type { TextField, TextFieldSingleValidation } from 'payload'

/**
 * Base slug shape shared across collections. Deliberately has no
 * auto-generation/lifecycle hooks - those belong to a later phase.
 * Collections that need reserved-slug or cross-collection validation
 * (Categories, Pages) pass `validate` in.
 */
export function slugField(options: { validate?: TextFieldSingleValidation } = {}): TextField {
  if (options.validate) {
    return {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
      validate: options.validate,
    }
  }

  return {
    name: 'slug',
    type: 'text',
    required: true,
    unique: true,
    index: true,
    admin: {
      position: 'sidebar',
    },
  }
}
