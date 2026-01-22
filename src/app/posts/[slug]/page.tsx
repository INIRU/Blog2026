import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { PostDetailContent } from '@/components/post/PostDetailContent';

export const revalidate = 60;

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();
  return data;
}

async function getRelatedPosts(tags: string[], currentId: string) {
  if (!tags || tags.length === 0) return [];
  
  const supabase = createServerClient();
  const { data } = await supabase
    .from('posts')
    .select('id, title, slug, thumbnail_url, published_at')
    .eq('published', true)
    .neq('id', currentId)
    .overlaps('tags', tags)
    .order('published_at', { ascending: false })
    .limit(3);
  return data ?? [];
}

async function incrementViewCount(id: string) {
  const supabase = createServerClient();
  await supabase.rpc('increment_view_count', { post_id: id });
}

async function getAdjacentPosts(publishedAt: string, currentId: string) {
  const supabase = createServerClient();
  
  const [prevResult, nextResult] = await Promise.all([
    supabase
      .from('posts')
      .select('slug, title')
      .eq('published', true)
      .neq('id', currentId)
      .lt('published_at', publishedAt)
      .order('published_at', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('posts')
      .select('slug, title')
      .eq('published', true)
      .neq('id', currentId)
      .gt('published_at', publishedAt)
      .order('published_at', { ascending: true })
      .limit(1)
      .single(),
  ]);

  return {
    prevPost: prevResult.data,
    nextPost: nextResult.data,
  };
}

async function getSeriesPosts(seriesName: string | null) {
  if (!seriesName) return null;
  
  const supabase = createServerClient();
  const { data } = await supabase
    .from('posts')
    .select('slug, title, series_order')
    .eq('published', true)
    .eq('series_name', seriesName)
    .not('series_order', 'is', null)
    .order('series_order', { ascending: true });
  
  if (!data) return null;
  
  return data.map((post) => ({
    slug: post.slug,
    title: post.title,
    series_order: post.series_order as number,
  }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  
  if (!post) {
    return { title: 'Post Not Found' };
  }

  const url = `https://blog.iniru.xyz/posts/${slug}`;

  return {
    title: post.title,
    description: post.excerpt || `${post.title} - INIRU Blog`,
    keywords: post.tags,
    authors: [{ name: 'INIRU' }],
    openGraph: {
      title: post.title,
      description: post.excerpt || `${post.title} - INIRU Blog`,
      url,
      type: 'article',
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at,
      authors: ['INIRU'],
      tags: post.tags,
      images: post.thumbnail_url 
        ? [{ url: post.thumbnail_url, width: 1200, height: 630, alt: post.title }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || `${post.title} - INIRU Blog`,
      images: post.thumbnail_url ? [post.thumbnail_url] : [],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const [relatedPosts, { prevPost, nextPost }, seriesPosts] = await Promise.all([
    getRelatedPosts(post.tags, post.id),
    getAdjacentPosts(post.published_at ?? post.created_at, post.id),
    getSeriesPosts(post.series_name),
  ]);
  
  incrementViewCount(post.id);

  return (
    <PostDetailContent 
      post={post} 
      relatedPosts={relatedPosts} 
      prevPost={prevPost}
      nextPost={nextPost}
      seriesPosts={seriesPosts}
    />
  );
}
