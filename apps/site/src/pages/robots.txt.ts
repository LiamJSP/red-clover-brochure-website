export async function GET() {
  const siteUrl = import.meta.env.PUBLIC_SITE_URL || 'https://example.com';

  const body = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap-index.xml
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
