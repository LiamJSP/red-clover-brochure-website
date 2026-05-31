export type ButtonLink = {
  label?: string | null;
  href?: string | null;
};

export type CmsListResponse<T> = {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
};

export type SiteSetting = {
  brandName: string;
  tagline: string;
  siteUrl: string;
  contactEmail: string;
  phone?: string | null;
  calendlyUrl?: string | null;
  linkedinUrl?: string | null;
  ownerLine: string;
  footerNote?: string | null;
  defaultMetaTitle?: string | null;
  defaultMetaDescription?: string | null;
  trustPills?: { label: string }[];
  logo?: {
    url: string;
    alt: string;
  } | null;
  footerLogo?: {
    url: string;
    alt: string;
  } | null;
};

export type BaseBlock = {
  blockType: string;
  id?: string;
};

export type MarkdownSectionBlock = BaseBlock & {
  blockType: 'markdownSection';
  eyebrow?: string | null;
  heading?: string | null;
  content: string;
  tone?: 'default' | 'muted' | 'accent' | null;
  backgroundImage?: CmsMediaAsset | null;
};

export type FeatureGridBlock = BaseBlock & {
  blockType: 'featureGrid';
  eyebrow?: string | null;
  heading: string;
  intro?: string | null;
  items: {
    title: string;
    description: string;
    href?: string | null;
    linkLabel?: string | null;
    badge?: string | null;
  }[];
};

export type BulletListBlock = BaseBlock & {
  blockType: 'bulletList';
  eyebrow?: string | null;
  heading: string;
  intro?: string | null;
  items: {
    title?: string | null;
    description: string;
    icon?: string;
  }[];
};

export type TimelineBlock = BaseBlock & {
  blockType: 'timeline';
  eyebrow?: string | null;
  heading: string;
  intro?: string | null;
  steps: {
    title: string;
    description: string;
  }[];
};

export type CaseStudyReference = {
  id?: string;
  title: string;
  slug: string;
  sector?: string | null;
  summary: string;
  services?: { label: string }[];
  featured?: boolean;
  isRepresentative?: boolean;
};

export type CaseStudyHighlightsBlock = BaseBlock & {
  blockType: 'caseStudyHighlights';
  eyebrow?: string | null;
  heading: string;
  intro?: string | null;
  selectedCaseStudies: CaseStudyReference[];
};

export type PricingTiersBlock = BaseBlock & {
  blockType: 'pricingTiers';
  eyebrow?: string | null;
  heading: string;
  intro?: string | null;
  tiers: {
    name: string;
    priceLabel: string;
    tagline: string;
    responseWindow?: string | null;
    highlighted?: boolean;
    ctaLabel?: string | null;
    ctaHref?: string | null;
    note?: string | null;
    features: { feature: string }[];
  }[];
};

export type FAQBlock = BaseBlock & {
  blockType: 'faq';
  eyebrow?: string | null;
  heading: string;
  intro?: string | null;
  items: {
    question: string;
    answer: string;
  }[];
};

export type CTABandBlock = BaseBlock & {
  blockType: 'ctaBand';
  eyebrow?: string | null;
  heading: string;
  body: string;
  tone?: 'plum' | 'green' | 'neutral' | null;
  primaryActionLabel?: string | null;
  primaryActionHref?: string | null;
  secondaryActionLabel?: string | null;
  secondaryActionHref?: string | null;
};

export type ContactMethodsBlock = BaseBlock & {
  blockType: 'contactMethods';
  eyebrow?: string | null;
  heading: string;
  intro?: string | null;
  emailLabel?: string | null;
  email?: string | null;
  phoneLabel?: string | null;
  phone?: string | null;
  calendlyLabel?: string | null;
  calendlyUrl?: string | null;
  embedUrl?: string | null;
  note?: string | null;
  responseWindows?: {
    label: string;
    description: string;
  }[];
};

export type PageBlock =
  | MarkdownSectionBlock
  | FeatureGridBlock
  | BulletListBlock
  | TimelineBlock
  | CaseStudyHighlightsBlock
  | PricingTiersBlock
  | FAQBlock
  | CTABandBlock
  | ContactMethodsBlock;

export type CmsMediaAsset = {
  url?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
};

export type Page = {
  id?: string;
  title: string;
  pathname: string;
  status: 'draft' | 'published';
  metaTitle?: string | null;
  metaDescription?: string | null;
  hero?: {
    eyebrow?: string | null;
    headline?: string | null;
    subheadline?: string | null;
    primaryActionLabel?: string | null;
    primaryActionHref?: string | null;
    secondaryActionLabel?: string | null;
    secondaryActionHref?: string | null;
    workPreviewStrip?: CmsMediaAsset | null;
    websitePreviewStrip?: CmsMediaAsset | null;
    websitePreviewLabel?: string | null;
  } | null;
  summary?: string | null;
  layout?: PageBlock[];
};

export type CaseStudy = {
  id?: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  summary: string;
  sector?: string | null;
  services?: { label: string }[];
  challenge: string;
  approach: string;
  outcome: string;
  publishedAt?: string | null;
  featured?: boolean;
  isRepresentative?: boolean;
};

export type Post = {
  id?: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  excerpt: string;
  body: string;
  publishedAt?: string | null;
  authorName?: string | null;
};
