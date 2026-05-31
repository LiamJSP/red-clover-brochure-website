import rss from '@astrojs/rss';
import { getAllPosts, getSiteSetting } from '../lib/cms';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const [posts, settings] = await Promise.all([
    getAllPosts(),
    getSiteSetting(),
  ]);

  return rss({
    title: `${settings.brandName} News`,
    description: settings.defaultMetaDescription || settings.tagline,
    site: context.site || settings.siteUrl,
    items: posts.map((post) => ({
      title: post.title,
      description: post.excerpt,
      pubDate: post.publishedAt ? new Date(post.publishedAt) : new Date(),
      link: `/news/${post.slug}`,
    })),
  });
}