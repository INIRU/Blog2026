import { MetadataRoute } from 'next';
import { createServerClient } from '@/lib/supabase/server';

const SITE_URL = 'https://blog.iniru.xyz';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerClient();

  const { data: posts } = await supabase
    .from('posts')
    .select('slug, updated_at, published_at, tags, series_name')
    .eq('published', true)
    .order('published_at', { ascending: false });

  const tags = new Set<string>();
  posts?.forEach((post) => {
    post.tags?.forEach((tag: string) => tags.add(tag));
  });

  const series = new Set<string>();
  posts?.forEach((post) => {
    if (post.series_name) {
      series.add(post.series_name);
    }
  });

  const routes = ['', '/posts', '/tags', '/series', '/search'].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const postRoutes = (posts || []).map((post) => ({
    url: `${SITE_URL}/posts/${post.slug}`,
    lastModified: post.updated_at || post.published_at || new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const tagRoutes = Array.from(tags).map((tag) => ({
    url: `${SITE_URL}/tags/${encodeURIComponent(tag)}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const seriesRoutes = Array.from(series).map((name) => ({
    url: `${SITE_URL}/series/${encodeURIComponent(name)}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...routes, ...postRoutes, ...tagRoutes, ...seriesRoutes];
}
