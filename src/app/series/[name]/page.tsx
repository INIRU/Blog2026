import { createServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { HiArrowLeft, HiCalendar } from 'react-icons/hi';
import { formatKoDate, formatKoShortDate } from '@/lib/post/postUtils';
import styles from '@/styles/pages/series/detail.module.css';

export const revalidate = 3600;

interface SeriesDetailProps {
  params: Promise<{ name: string }>;
}

async function getSeriesPosts(name: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, published_at, series_order')
    .eq('published', true)
    .eq('series_name', name)
    .order('series_order', { ascending: true });

  return data ?? [];
}

export async function generateMetadata({ params }: SeriesDetailProps) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const url = `https://blog.iniru.xyz/series/${name}`;
  
  return {
    title: `${decodedName} Series`,
    description: `${decodedName} 시리즈의 모든 글을 모아보세요.`,
    openGraph: {
      title: `${decodedName} Series | INIRU Blog`,
      description: `${decodedName} 시리즈의 모든 글을 모아보세요.`,
      url,
      type: 'website',
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function SeriesDetailPage({ params }: SeriesDetailProps) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const posts = await getSeriesPosts(decodedName);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className={styles.container}>
      <Link href="/series" className={styles.backLink}>
        <HiArrowLeft />
        시리즈 목록
      </Link>

      <div className={styles.header}>
        <div className={styles.metaLabel}>SERIES COLLECTION</div>
        <h1 className={styles.title}>{decodedName}</h1>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{posts.length}</span>
            <span className={styles.statLabel}>Chapters</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statValue}>
              {formatKoDate(posts[posts.length - 1]?.published_at)}
            </span>
            <span className={styles.statLabel}>Latest Update</span>
          </div>
        </div>
      </div>

      <div className={styles.tracklist}>
        {posts.map((post, index) => (
          <Link key={post.id} href={`/posts/${post.slug}`} className={styles.track}>
            <div className={styles.trackIndex}>
              {(index + 1).toString().padStart(2, '0')}
            </div>
            <div className={styles.trackContent}>
              <h2 className={styles.trackTitle}>{post.title}</h2>
              <p className={styles.trackExcerpt}>{post.excerpt}</p>
            </div>
            <div className={styles.trackMeta}>
              <span className={styles.date}>
                {formatKoShortDate(post.published_at)}
              </span>
              <HiCalendar className={styles.icon} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
