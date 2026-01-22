import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { HomeContent } from '@/components/home/HomeContent';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'INIRU Blog - 개발 블로그',
  description: '개발, 기술, 그리고 생각들을 기록하는 공간입니다. 웹 개발, React, Next.js, TypeScript에 관한 글을 공유합니다.',
  openGraph: {
    title: 'INIRU Blog - 개발 블로그',
    description: '개발, 기술, 그리고 생각들을 기록하는 공간입니다.',
    url: 'https://blog.iniru.xyz',
    type: 'website',
  },
  alternates: {
    canonical: 'https://blog.iniru.xyz',
  },
};

async function getRecentPosts() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(6);
  return data ?? [];
}

async function getPopularTags() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('posts')
    .select('tags')
    .eq('published', true);
  
  if (!data) return [];
  
  const tagCount: Record<string, number> = {};
  data.forEach((post) => {
    post.tags?.forEach((tag: string) => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });
  
  return Object.entries(tagCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([tag, count]) => ({ tag, count }));
}

export default async function HomePage() {
  const [recentPosts, popularTags] = await Promise.all([
    getRecentPosts(),
    getPopularTags(),
  ]);

  return <HomeContent recentPosts={recentPosts} popularTags={popularTags} />;
}
