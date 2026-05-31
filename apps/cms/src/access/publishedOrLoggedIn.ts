import type { Access } from 'payload'

export const publishedOrLoggedIn: Access = ({ req }) => {
  if (req.user) return true

  return {
    status: {
      equals: 'published',
    },
  }
}
