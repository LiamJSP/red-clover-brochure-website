import type { Access } from 'payload'

export const isAdmin: Access = ({ req: { user } }) => {
  if (!user) return false

  return 'role' in user && user.role === 'admin'
}
