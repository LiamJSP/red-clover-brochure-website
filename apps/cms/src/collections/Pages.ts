import type { CollectionConfig } from 'payload'
import { publishedOrLoggedIn } from '../access/publishedOrLoggedIn'
import { isAdmin } from '../access/isAdmin'
import { normalizePath } from '../hooks/normalizePath'
import {
  triggerSiteDeployAfterChange,
  triggerSiteDeployAfterDelete,
} from '../hooks/triggerSiteDeploy'
import { MarkdownSection } from '../blocks/MarkdownSection'
import { FeatureGrid } from '../blocks/FeatureGrid'
import { BulletList } from '../blocks/BulletList'
import { Timeline } from '../blocks/Timeline'
import { CaseStudyHighlights } from '../blocks/CaseStudyHighlights'
import { PricingTiers } from '../blocks/PricingTiers'
import { FAQ } from '../blocks/FAQ'
import { CTABand } from '../blocks/CTABand'
import { ContactMethods } from '../blocks/ContactMethods'
import { Archive } from '../blocks/Archive'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'pathname', 'status'],
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
      name: 'pathname',
      type: 'text',
      required: true,
      unique: true,
      hooks: {
        beforeValidate: [normalizePath],
      },
      admin: {
        description: 'Use full route paths such as / or /services/maintenance-support',
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
      name: 'metaTitle',
      type: 'text',
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      required: true,
    },
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'headline', type: 'text' },
        { name: 'subheadline', type: 'textarea' },
        { name: 'primaryActionLabel', type: 'text' },
        { name: 'primaryActionHref', type: 'text' },
        { name: 'secondaryActionLabel', type: 'text' },
        { name: 'secondaryActionHref', type: 'text' },
        { name: 'workPreviewStrip', type: 'upload', relationTo: 'media' },
        { name: 'websitePreviewLabel', type: 'text' },
        { name: 'media', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'summary',
      type: 'textarea',
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [
        MarkdownSection,
        FeatureGrid,
        BulletList,
        Timeline,
        CaseStudyHighlights,
        PricingTiers,
        FAQ,
        CTABand,
        ContactMethods,
        Archive,
      ],
    },
  ],
}