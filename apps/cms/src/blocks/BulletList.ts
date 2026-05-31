// apps/cms/src/blocks/BulletList.ts
import type { Block } from 'payload'

export const BulletList: Block = {
  slug: 'bulletList',
  labels: {
    singular: 'Bullet List',
    plural: 'Bullet Lists',
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
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
        {
          name: 'icon',
          type: 'text',
          label: 'Phosphor Icon Name',
          admin: {
            description:
              'Enter a valid Phosphor icon name (e.g., Gear, ArrowRight, CheckCircle, ShieldCheck). Leave blank to use the default gradient bullet.',
          },
        },
      ],
    },
  ],
}
