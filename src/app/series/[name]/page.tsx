import { createServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { HiCollection, HiCalendar, HiClock } from 'react-icons/hi';
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
  
  return {
    title: `${decodedName} Series`,
    description: `${decodedName} 시리즈의 모든 글을 모아보세요.`,
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
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <HiCollection />
        </div>
        <h1 className={styles.title}>{decodedName}</h1>
        <p className={styles.meta}>
          총 {posts.length}개의 포스트
        </p>
      </div>

      <div className={styles.timeline}>
        {posts.map((post, index) => (
          <div key={post.id} className={styles.item}>
            <div className={styles.itemNumber}>{index + 1}</div>
            <Link href={`/posts/${post.slug}`} className={styles.card}>
              <h2 className={styles.cardTitle}>{post.title}</h2>
              <p className={styles.cardExcerpt}>{post.excerpt}</p>
              <div className={styles.cardMeta}>
                <span className={styles.date}>
                  <HiCalendar />
                  {new Date(post.published_at!).toLocaleDateString()}
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
