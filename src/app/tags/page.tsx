import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { TagsContent } from '@/components/tags/TagsContent';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Tags',
  description: '모든 태그 목록입니다. 관심 있는 주제의 글을 찾아보세요.',
  openGraph: {
    title: 'Tags | INIRU Blog',
    description: '모든 태그 목록입니다.',
    url: 'https://blog.iniru.xyz/tags',
    type: 'website',
  },
  alternates: {
    canonical: 'https://blog.iniru.xyz/tags',
  },
};

async function getAllTags() {
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
    .map(([tag, count]) => ({ tag, count }));
}

export default async function TagsPage() {
  const tags = await getAllTags();
  return <TagsContent tags={tags} />;
}
