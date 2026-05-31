import type { Block } from 'payload'

export const ContactMethods: Block = {
  slug: 'contactMethods',
  labels: {
    singular: 'Contact Methods',
    plural: 'Contact Methods',
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
      name: 'emailLabel',
      type: 'text',
    },
    {
      name: 'email',
      type: 'text',
    },
    {
      name: 'phoneLabel',
      type: 'text',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'calendlyLabel',
      type: 'text',
    },
    {
      name: 'calendlyUrl',
      type: 'text',
    },
    {
      name: 'embedUrl',
      type: 'text',
    },
    {
      name: 'note',
      type: 'textarea',
    },
    {
      name: 'responseWindows',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
      ],
    },
  ],
}
