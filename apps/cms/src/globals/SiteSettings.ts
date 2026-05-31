import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { triggerSiteDeployAfterGlobalChange } from '../hooks/triggerSiteDeploy'

export const SiteSetting: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
    update: isAdmin,
  },
  hooks: {
    afterChange: [triggerSiteDeployAfterGlobalChange],
  },
  fields: [
    {
      name: 'brandName',
      type: 'text',
      required: true,
    },
    {
      name: 'tagline',
      type: 'text',
      required: true,
    },
    {
      name: 'siteUrl',
      type: 'text',
      required: true,
    },
    {
      name: 'contactEmail',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'calendlyUrl',
      type: 'text',
    },
    {
      name: 'linkedinUrl',
      type: 'text',
    },
    {
      name: 'ownerLine',
      type: 'textarea',
      required: true,
    },
    {
      name: 'footerNote',
      type: 'textarea',
    },
    {
      name: 'defaultMetaTitle',
      type: 'text',
      required: true,
    },
    {
      name: 'defaultMetaDescription',
      type: 'textarea',
      required: true,
    },
    {
      name: 'trustPills',
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
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Upload the logo image to appear in the site header.',
      },
    },
    {
      name: 'footerLogo',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description:
          'Upload the logo image to appear in the site footer. Display will be constrained to max 2rem.',
      },
    },
  ],
}
