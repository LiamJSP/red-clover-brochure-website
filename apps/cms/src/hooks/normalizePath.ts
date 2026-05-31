import type { FieldHook } from 'payload'
import { slugify } from '../utilities/slugify'

export const normalizePath: FieldHook = ({ value, data }) => {
  const source = typeof value === 'string' && value.length > 0 ? value : data?.title
  if (!source) return '/'

  let nextValue = String(source).trim()

  if (!nextValue.startsWith('/')) {
    nextValue = slugify(nextValue)
    nextValue = `/${nextValue}`
  }

  nextValue = nextValue.replace(/\/+/g, '/')

  if (nextValue.length > 1 && nextValue.endsWith('/')) {
    nextValue = nextValue.slice(0, -1)
  }

  return nextValue || '/'
}
