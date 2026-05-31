import type { CollectionConfig } from 'payload'
import { publishedOrLoggedIn } from '../access/publishedOrLoggedIn'
import { isAdmin } from '../access/isAdmin'
import { formatSlug } from '../hooks/formatSlug'
import {
  triggerSiteDeployAfterChange,
  triggerSiteDeployAfterDelete,
} from '../hooks/triggerSiteDeploy'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'publishedAt'],
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
      name: 'excerpt',
      type: 'textarea',
      required: true,
    },
    {
      name: 'authorName',
      type: 'text',
      defaultValue: 'Red Clover Software',
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
    },
  ],
}
