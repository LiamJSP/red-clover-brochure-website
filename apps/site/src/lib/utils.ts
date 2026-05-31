import type { SiteSetting } from '@red-clover/cms/payload-types';

export function joinUrl(base: string, path: string) {
  const url = new URL(path, base);
  return url.toString();
}

export function toLabel(value: string) {
  return value
    .replace(/[-/]/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function buildPageTitle(
  title: string | undefined | null,
  settings: SiteSetting,
  isHome = false
) {
  const fallback = settings.defaultMetaTitle || settings.brandName;
  if (isHome) return title || fallback;
  if (!title) return fallback;
  return `${title} | ${settings.brandName}`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-CA', {
    dateStyle: 'long',
  }).format(new Date(value));
}

export function isExternalHref(href: string | null | undefined) {
  if (!href) return false;
  return /^https?:\/\//.test(href);
}
