import { describe, expect, it } from 'vitest'
import type { Post } from '@/payload-types'

import { canViewDraftRevision } from './authorize-draft-content'

type MinimalPost = Pick<Post, '_status' | 'author'>

describe('canViewDraftRevision', () => {
  it('permite ver un Post que no está en borrador, sin importar el usuario', () => {
    const post: MinimalPost = { _status: 'published', author: 1 }
    expect(canViewDraftRevision(post, null)).toBe(true)
    expect(canViewDraftRevision(post, { id: 999, role: 'writer' })).toBe(true)
  })

  it('un Admin puede ver cualquier revisión en borrador', () => {
    const post: MinimalPost = { _status: 'draft', author: 1 }
    expect(canViewDraftRevision(post, { id: 999, role: 'admin' })).toBe(true)
  })

  it('el autor puede ver su propia revisión en borrador', () => {
    const post: MinimalPost = { _status: 'draft', author: 42 }
    expect(canViewDraftRevision(post, { id: 42, role: 'writer' })).toBe(true)
  })

  it('el autor puede ver su propia revisión en borrador cuando `author` llega poblado (objeto)', () => {
    const post: MinimalPost = { _status: 'draft', author: { id: 42 } as unknown as Post['author'] }
    expect(canViewDraftRevision(post, { id: 42, role: 'writer' })).toBe(true)
  })

  it('un Writer que no es el autor no puede ver la revisión en borrador', () => {
    const post: MinimalPost = { _status: 'draft', author: 42 }
    expect(canViewDraftRevision(post, { id: 999, role: 'writer' })).toBe(false)
  })

  it('sin usuario autenticado, la revisión en borrador nunca es visible', () => {
    const post: MinimalPost = { _status: 'draft', author: 42 }
    expect(canViewDraftRevision(post, null)).toBe(false)
    expect(canViewDraftRevision(post, undefined)).toBe(false)
  })
})
