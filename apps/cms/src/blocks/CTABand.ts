import type { Block } from 'payload'

export const CTABand: Block = {
  slug: 'ctaBand',
  labels: {
    singular: 'CTA Band',
    plural: 'CTA Bands',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
    },
    {
      name: 'tone',
      type: 'select',
      defaultValue: 'plum',
      options: [
        { label: 'Plum', value: 'plum' },
        { label: 'Green', value: 'green' },
        { label: 'Neutral', value: 'neutral' },
      ],
    },
    {
      name: 'primaryActionLabel',
      type: 'text',
    },
    {
      name: 'primaryActionHref',
      type: 'text',
    },
    {
      name: 'secondaryActionLabel',
      type: 'text',
    },
    {
      name: 'secondaryActionHref',
      type: 'text',
    },
  ],
}
