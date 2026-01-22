import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { PostsContent } from '@/components/post/PostsContent';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Posts',
  description: '모든 블로그 글 목록입니다. 웹 개발, React, Next.js, TypeScript에 관한 글을 확인하세요.',
  openGraph: {
    title: 'Posts | INIRU Blog',
    description: '모든 블로그 글 목록입니다.',
    url: 'https://blog.iniru.xyz/posts',
    type: 'website',
  },
  alternates: {
    canonical: 'https://blog.iniru.xyz/posts',
  },
};

interface PostsPageProps {
  searchParams: Promise<{ tag?: string; page?: string }>;
}

async function getPosts(tag?: string, page: number = 1) {
  const supabase = createServerClient();
  const perPage = 12;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('published', true)
    .order('published_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  if (tag) {
    query = query.contains('tags', [tag]);
  }

  const { data, count } = await query;
  return { posts: data ?? [], total: count ?? 0, perPage };
}

async function getAllTags() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('posts')
    .select('tags')
    .eq('published', true);

  if (!data) return [];

  const tagSet = new Set<string>();
  data.forEach((post) => {
    post.tags?.forEach((tag: string) => tagSet.add(tag));
  });

  return Array.from(tagSet).sort();
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const params = await searchParams;
  const currentTag = params.tag;
  const currentPage = parseInt(params.page || '1', 10);

  const [{ posts, total, perPage }, allTags] = await Promise.all([
    getPosts(currentTag, currentPage),
    getAllTags(),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <PostsContent
      posts={posts}
      total={total}
      totalPages={totalPages}
      currentPage={currentPage}
      currentTag={currentTag}
      allTags={allTags}
    />
  );
}
