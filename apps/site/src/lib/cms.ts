import type {
  CaseStudy,
  Page,
  Post,
  SiteSetting, // Notice it is singular now!
} from '@red-clover/cms/payload-types';

// Define the REST API wrapper shape
export type PayloadListResponse<T> = {
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

const CMS_URL =
  import.meta.env.CMS_URL ||
  import.meta.env.PUBLIC_CMS_URL ||
  'http://localhost:3000';

const pageCache = new Map<string, Promise<unknown>>();

function withCache<T>(key: string, producer: () => Promise<T>): Promise<T> {
  const existing = pageCache.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const next = producer();
  pageCache.set(key, next as Promise<unknown>);
  return next;
}

async function fetchJSON<T>(
  path: string,
  params: Record<string, string> = {}
): Promise<T> {
  const url = new URL(path, CMS_URL);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `CMS request failed for ${url.toString()} (${response.status})`
    );
  }

  return (await response.json()) as T;
}

export function getSiteSetting() {
  return withCache('global:site-settings', async () => {
    const settings = await fetchJSON<SiteSetting>(
      '/api/globals/site-settings'
    );
    return settings;
  });
}

export function getAllPages() {
  return withCache('collection:pages', async () => {
    const result = await fetchJSON<PayloadListResponse<Page>>('/api/pages', {
      limit: '100',
      depth: '2',
      sort: 'pathname',
      'where[status][equals]': 'published',
    });
    return result.docs;
  });
}

export async function getPageByPath(pathname: string) {
  const normalized = pathname === '' ? '/' : pathname;
  const result = await fetchJSON<PayloadListResponse<Page>>('/api/pages', {
    limit: '1',
    depth: '2',
    'where[pathname][equals]': normalized,
    'where[status][equals]': 'published',
  });
  return result.docs[0] ?? null;
}

export function getAllCaseStudies() {
  return withCache('collection:case-studies', async () => {
    const result = await fetchJSON<PayloadListResponse<CaseStudy>>(
      '/api/case-studies',
      {
        limit: '100',
        depth: '2',
        sort: '-publishedAt',
        'where[status][equals]': 'published',
      }
    );
    return result.docs;
  });
}

export async function getFeaturedCaseStudies() {
  const all = await getAllCaseStudies();
  return all.filter((item) => item.featured).slice(0, 3);
}

export async function getCaseStudyBySlug(slug: string) {
  const result = await fetchJSON<PayloadListResponse<CaseStudy>>(
    '/api/case-studies',
    {
      limit: '1',
      depth: '2',
      'where[slug][equals]': slug,
      'where[status][equals]': 'published',
    }
  );
  return result.docs[0] ?? null;
}

export function getAllPosts() {
  return withCache('collection:posts', async () => {
    const result = await fetchJSON<PayloadListResponse<Post>>('/api/posts', {
      limit: '100',
      depth: '1',
      sort: '-publishedAt',
      'where[status][equals]': 'published',
    });
    return result.docs;
  });
}

export async function getPostBySlug(slug: string) {
  const result = await fetchJSON<PayloadListResponse<Post>>('/api/posts', {
    limit: '1',
    depth: '1',
    'where[slug][equals]': slug,
    'where[status][equals]': 'published',
  });
  return result.docs[0] ?? null;
}