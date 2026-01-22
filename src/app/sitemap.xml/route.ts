import { createServerClient } from '@/lib/supabase/server';

const SITE_URL = 'https://blog.iniru.xyz';

export async function GET() {
  const supabase = createServerClient();

  const { data: posts } = await supabase
    .from('posts')
    .select('slug, updated_at, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false });

  const { data: tagsData } = await supabase
    .from('posts')
    .select('tags')
    .eq('published', true);

  const tags = new Set<string>();
  tagsData?.forEach((post) => {
    post.tags?.forEach((tag: string) => tags.add(tag));
  });

  const staticPages = [
    { url: '', lastmod: new Date().toISOString(), priority: '1.0', changefreq: 'daily' },
    { url: '/posts', lastmod: new Date().toISOString(), priority: '0.9', changefreq: 'daily' },
    { url: '/tags', lastmod: new Date().toISOString(), priority: '0.8', changefreq: 'weekly' },
    { url: '/search', lastmod: new Date().toISOString(), priority: '0.7', changefreq: 'monthly' },
  ];

  const postPages = (posts || []).map((post) => ({
    url: `/posts/${post.slug}`,
    lastmod: post.updated_at || post.published_at || new Date().toISOString(),
    priority: '0.8',
    changefreq: 'weekly',
  }));

  const tagPages = Array.from(tags).map((tag) => ({
    url: `/tags/${encodeURIComponent(tag)}`,
    lastmod: new Date().toISOString(),
    priority: '0.6',
    changefreq: 'weekly',
  }));

  const allPages = [...staticPages, ...postPages, ...tagPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
