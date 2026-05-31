import type { Block } from 'payload'

export const Archive: Block = {
  slug: 'archive',
  labels: {
    singular: 'Archive',
    plural: 'Archives',
  },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text', required: true },
    { name: 'intro', type: 'textarea' },
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'collection',
      options: [
        { label: 'Collection', value: 'collection' },
        { label: 'Individual Selection', value: 'selection' },
      ],
    },
    {
      name: 'relationTo',
      type: 'select',
      admin: { condition: (_, siblingData) => siblingData.populateBy === 'collection' },
      defaultValue: 'posts',
      options: [{ label: 'Posts', value: 'posts' }],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: { condition: (_, siblingData) => siblingData.populateBy === 'collection' },
      hasMany: true,
      relationTo: 'categories',
    },
    {
      name: 'limit',
      type: 'number',
      admin: { condition: (_, siblingData) => siblingData.populateBy === 'collection', step: 1 },
      defaultValue: 10,
    },
    {
      name: 'selectedDocs',
      type: 'relationship',
      admin: { condition: (_, siblingData) => siblingData.populateBy === 'selection' },
      hasMany: true,
      relationTo: ['posts'],
    },
  ],
}