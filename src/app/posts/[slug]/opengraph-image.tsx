import { ImageResponse } from 'next/og';
import { createServerClient } from '@/lib/supabase/server';

export const runtime = 'edge';
export const alt = 'Post thumbnail';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const supabase = createServerClient();
  const { data: post } = await supabase
    .from('posts')
    .select('title, excerpt, tags, published_at')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  const title = post?.title || 'Post Not Found';
  const excerpt = post?.excerpt || '';
  const tags = post?.tags?.slice(0, 3) || [];
  const date = post?.published_at
    ? new Date(post.published_at).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              fontSize: '56px',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '1000px',
            }}
          >
            {title}
          </div>
          
          {excerpt && (
            <div
              style={{
                fontSize: '24px',
                color: '#a0aec0',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                maxWidth: '900px',
              }}
            >
              {excerpt}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {tags.map((tag) => (
              <div
                key={tag}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(99, 102, 241, 0.3)',
                  borderRadius: '9999px',
                  fontSize: '18px',
                  color: '#a5b4fc',
                }}
              >
                #{tag}
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            {date && (
              <div style={{ fontSize: '20px', color: '#718096' }}>
                {date}
              </div>
            )}
            <div
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#6366f1',
              }}
            >
              INIRU Blog
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
