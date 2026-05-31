import type { Block } from 'payload'

export const CaseStudyHighlights: Block = {
  slug: 'caseStudyHighlights',
  labels: {
    singular: 'Case Study Highlights',
    plural: 'Case Study Highlights',
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
      name: 'selectedCaseStudies',
      type: 'relationship',
      relationTo: 'case-studies',
      hasMany: true,
      required: true,
    },
  ],
}
