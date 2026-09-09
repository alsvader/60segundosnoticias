import type { Access, FieldAccess } from 'payload'

export const isAdmin: Access = ({ req }) => req.user?.role === 'admin'

export const isAdminFieldAccess: FieldAccess = ({ req }) => req.user?.role === 'admin'

export const isAdminOrWriter: Access = ({ req }) => {
  return req.user?.role === 'admin' || req.user?.role === 'writer'
}

export const isLoggedIn: Access = ({ req }) => Boolean(req.user)

export const isLoggedInFieldAccess: FieldAccess = ({ req }) => Boolean(req.user)

export const anyone: Access = () => true

/**
 * Admin has full access; anyone else must own the document through the
 * given relationship field (compared against `req.user.id`). Returns a
 * query constraint so it also filters list/find operations, not just
 * single-document checks.
 */
export const isOwnerOrAdmin = (ownerField: string): Access => {
  return ({ req }) => {
    if (!req.user) return false
    if (req.user.role === 'admin') return true
    return { [ownerField]: { equals: req.user.id } }
  }
}
