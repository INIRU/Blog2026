import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { PostDetailContent } from '@/components/post/PostDetailContent';

export const dynamic = 'force-dynamic';

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

async function getPostById(id: string) {
  const supabase = createServerClient();
  const { data } = await supabase.from('posts').select('*').eq('id', id).single();
  return data;
}

async function verifyAdmin() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  return user.email === process.env.ADMIN_EMAIL;
}

export async function generateMetadata({ params }: PreviewPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    return { title: 'Preview Not Found' };
  }

  return {
    title: `[미리보기] ${post.title}`,
    robots: { index: false, follow: false },
  };
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  if (post.published) {
    redirect(`/posts/${post.slug}`);
  }

  const isAdmin = await verifyAdmin();

  if (!isAdmin) {
    notFound();
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
          color: 'white',
          textAlign: 'center',
          padding: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 600,
        }}
      >
        미리보기 모드 - 이 글은 아직 발행되지 않았습니다
      </div>
      <div style={{ paddingTop: '2rem' }}>
        <PostDetailContent
          post={post}
          relatedPosts={[]}
          prevPost={null}
          nextPost={null}
          seriesPosts={null}
          isPreview
        />
      </div>
    </>
  );
}
