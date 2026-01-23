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
  searchParams: Promise<{ 
    tag?: string; 
    page?: string;
    q?: string;
    sort?: string;
  }>;
}

async function getPosts(tag?: string, page: number = 1, searchQuery?: string, sort?: string) {
  const supabase = createServerClient();
  const perPage = 12;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('published', true);

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`);
  }

  if (tag) {
    query = query.contains('tags', [tag]);
  }

  switch (sort) {
    case 'oldest':
      query = query.order('published_at', { ascending: true });
      break;
    case 'popular':
      query = query.order('view_count', { ascending: false });
      break;
    case 'latest':
    default:
      query = query.order('published_at', { ascending: false });
      break;
  }

  query = query.range(offset, offset + perPage - 1);

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
  const searchQuery = params.q;
  const sort = params.sort;

  const [{ posts, total, perPage }, allTags] = await Promise.all([
    getPosts(currentTag, currentPage, searchQuery, sort),
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
      searchQuery={searchQuery}
    />
  );
}
