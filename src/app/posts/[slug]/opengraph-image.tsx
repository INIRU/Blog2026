import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Post thumbnail';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function getPost(slug: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  const res = await fetch(
    `${supabaseUrl}/rest/v1/posts?slug=eq.${slug}&published=eq.true&select=title,excerpt,tags,published_at`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    }
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data?.[0] || null;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  const title = post?.title || 'INIRU Blog';
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
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              fontSize: '52px',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.3,
              wordBreak: 'keep-all',
              maxWidth: '1000px',
            }}
          >
            {title.length > 60 ? title.slice(0, 60) + '...' : title}
          </div>

          {excerpt && (
            <div
              style={{
                fontSize: '24px',
                color: '#94a3b8',
                lineHeight: 1.5,
                maxWidth: '900px',
              }}
            >
              {excerpt.length > 100 ? excerpt.slice(0, 100) + '...' : excerpt}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {tags.map((tag: string) => (
              <div
                key={tag}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(99, 102, 241, 0.25)',
                  borderRadius: '20px',
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
              <div style={{ fontSize: '18px', color: '#64748b' }}>
                {date}
              </div>
            )}
            <div
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#818cf8',
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
