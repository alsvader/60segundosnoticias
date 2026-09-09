import type { Access, FieldAccess } from 'payload'

export const isAdmin: Access = ({ req }) => req.user?.role === 'admin'

export const isAdminFieldAccess: FieldAccess = ({ req }) => req.user?.role === 'admin'

export const isAdminOrWriter: Access = ({ req }) => {
  return req.user?.role === 'admin' || req.user?.role === 'writer'
}

export const isLoggedIn: Access = ({ req }) => Boolean(req.user)

export const isLoggedInFieldAccess: FieldAccess = ({ req }) => Boolean(req.user)

export const anyone: Access = () => true
