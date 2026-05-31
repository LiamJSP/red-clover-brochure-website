import type { Block } from 'payload'

export const PricingTiers: Block = {
  slug: 'pricingTiers',
  labels: {
    singular: 'Pricing Tiers',
    plural: 'Pricing Tiers',
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
      name: 'intro',
      type: 'textarea',
    },
    {
      name: 'tiers',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'priceLabel',
          type: 'text',
          required: true,
        },
        {
          name: 'tagline',
          type: 'textarea',
          required: true,
        },
        {
          name: 'responseWindow',
          type: 'text',
        },
        {
          name: 'highlighted',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'note',
          type: 'textarea',
        },
        {
          name: 'ctaLabel',
          type: 'text',
        },
        {
          name: 'ctaHref',
          type: 'text',
        },
        {
          name: 'features',
          type: 'array',
          required: true,
          minRows: 1,
          fields: [
            {
              name: 'feature',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
  ],
}
