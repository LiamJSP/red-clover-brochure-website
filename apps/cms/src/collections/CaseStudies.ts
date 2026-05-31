import type { CollectionConfig } from 'payload'
import { publishedOrLoggedIn } from '../access/publishedOrLoggedIn'
import { isAdmin } from '../access/isAdmin'
import { formatSlug } from '../hooks/formatSlug'
import {
  triggerSiteDeployAfterChange,
  triggerSiteDeployAfterDelete,
} from '../hooks/triggerSiteDeploy'

export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'featured'],
  },
  access: {
    read: publishedOrLoggedIn,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [triggerSiteDeployAfterChange],
    afterDelete: [triggerSiteDeployAfterDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      hooks: {
        beforeValidate: [formatSlug('title')],
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'published',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
    },
    {
      name: 'sector',
      type: 'text',
    },
    {
      name: 'services',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'isRepresentative',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description:
          'Use this for seed/demo case studies until real anonymized stories replace them.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'challenge',
      type: 'textarea',
      required: true,
    },
    {
      name: 'approach',
      type: 'textarea',
      required: true,
    },
    {
      name: 'outcome',
      type: 'textarea',
      required: true,
    },
  ],
}
