import type { FieldHook } from 'payload'
import { slugify } from '../utilities/slugify'

export const formatSlug =
  (fallbackField = 'title'): FieldHook =>
  ({ value, data }) => {
    const source = value || data?.[fallbackField]
    if (!source) return value
    return slugify(String(source))
  }
