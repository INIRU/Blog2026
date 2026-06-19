import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { TagDetailContent } from '@/components/tags/TagDetailContent';

export const revalidate = 60;

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

async function getPostsByTag(tag: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .contains('tags', [tag])
    .order('published_at', { ascending: false });
  return data ?? [];
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const url = `https://blog.iniru.xyz/tags/${tag}`;
  
  return {
    title: `#${decodedTag}`,
    description: `"${decodedTag}" 태그가 포함된 글 목록입니다.`,
    openGraph: {
      title: `#${decodedTag} | INIRU Blog`,
      description: `"${decodedTag}" 태그가 포함된 글 목록입니다.`,
      url,
      type: 'website',
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = await getPostsByTag(decodedTag);

  return <TagDetailContent tag={decodedTag} posts={posts} />;
}
