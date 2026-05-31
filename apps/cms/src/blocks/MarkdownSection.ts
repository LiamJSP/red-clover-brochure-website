import type { Block } from 'payload'

export const MarkdownSection: Block = {
  slug: 'markdownSection',
  labels: {
    singular: 'Markdown Section',
    plural: 'Markdown Sections',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
    },
    {
      name: 'heading',
      type: 'text',
    },
    {
      name: 'tone',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Muted', value: 'muted' },
        { label: 'Accent', value: 'accent' },
      ],
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Location Background Image',
      admin: {
        description:
          'Optional image displayed on the left side. Will be automatically desaturated for use as a background graphic.',
      },
    },
  ],
}
