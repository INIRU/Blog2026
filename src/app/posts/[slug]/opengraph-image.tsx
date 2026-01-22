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
  const tags: string[] = post?.tags?.slice(0, 3) || [];
  const date = post?.published_at
    ? new Date(post.published_at).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const siteUrl = 'https://blog.iniru.xyz';

  const [fontBoldRes, fontRegularRes, characterRes] = await Promise.all([
    fetch('https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-kr@latest/korean-700-normal.ttf'),
    fetch('https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-kr@latest/korean-400-normal.ttf'),
    fetch(`${siteUrl}/INIRU.png`),
  ]);

  const [fontBoldData, fontRegularData, characterData] = await Promise.all([
    fontBoldRes.arrayBuffer(),
    fontRegularRes.arrayBuffer(),
    characterRes.arrayBuffer(),
  ]);

  const characterBase64 = `data:image/png;base64,${Buffer.from(characterData).toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: 'linear-gradient(145deg, #0f0f1a 0%, #1a1a2e 50%, #0f2847 100%)',
          fontFamily: 'NotoSansKR',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: '30px',
            right: '40px',
            width: '200px',
            height: '200px',
            borderRadius: '24px',
            overflow: 'hidden',
            border: '3px solid rgba(129, 140, 248, 0.3)',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
          }}
        >
          <img
            src={characterBase64}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '50px 60px',
            width: '100%',
            height: '100%',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '850px' }}>
            <div
              style={{
                display: 'flex',
                fontSize: '50px',
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}
            >
              {title.length > 50 ? title.slice(0, 50) + '...' : title}
            </div>

            {excerpt && (
              <div
                style={{
                  display: 'flex',
                  fontSize: '22px',
                  fontWeight: 400,
                  color: '#94a3b8',
                  lineHeight: 1.5,
                }}
              >
                {excerpt.length > 80 ? excerpt.slice(0, 80) + '...' : excerpt}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
              {tags.map((tag: string) => (
                <div
                  key={tag}
                  style={{
                    display: 'flex',
                    padding: '8px 18px',
                    background: 'rgba(99, 102, 241, 0.2)',
                    border: '1px solid rgba(129, 140, 248, 0.3)',
                    borderRadius: '24px',
                    fontSize: '16px',
                    fontWeight: 400,
                    color: '#a5b4fc',
                  }}
                >
                  #{tag}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: '26px',
                  fontWeight: 700,
                  color: '#f1f5f9',
                }}
              >
                INIRU Blog
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: '15px',
                  fontWeight: 400,
                  color: '#64748b',
                }}
              >
                blog.iniru.xyz
              </div>
            </div>

            {date && (
              <div
                style={{
                  display: 'flex',
                  fontSize: '16px',
                  fontWeight: 400,
                  color: '#64748b',
                }}
              >
                {date}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'NotoSansKR',
          data: fontBoldData,
          weight: 700,
          style: 'normal',
        },
        {
          name: 'NotoSansKR',
          data: fontRegularData,
          weight: 400,
          style: 'normal',
        },
      ],
    }
  );
}
