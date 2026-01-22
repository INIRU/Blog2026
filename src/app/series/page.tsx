import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { HiCollection } from 'react-icons/hi';
import styles from '@/styles/pages/series/page.module.css';

export const revalidate = 3600;

interface SeriesInfo {
  name: string;
  count: number;
  lastUpdated: string;
}

async function getSeriesList() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('posts')
    .select('series_name, published_at')
    .eq('published', true)
    .not('series_name', 'is', null)
    .order('published_at', { ascending: false });

  if (!data) return [];

  const seriesMap = new Map<string, SeriesInfo>();

  data.forEach((post) => {
    const name = post.series_name!;
    if (seriesMap.has(name)) {
      const info = seriesMap.get(name)!;
      info.count += 1;
      
    } else {
      seriesMap.set(name, {
        name,
        count: 1,
        lastUpdated: post.published_at || new Date().toISOString(),
      });
    }
  });

  return Array.from(seriesMap.values());
}

export default async function SeriesPage() {
  const seriesList = await getSeriesList();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Series</h1>
        <p className={styles.description}>
          주제별로 연재된 글들을 모아보세요. 총 {seriesList.length}개의 시리즈가 있습니다.
        </p>
      </div>

      <div className={styles.grid}>
        {seriesList.map((series) => (
          <Link
            key={series.name}
            href={`/series/${encodeURIComponent(series.name)}`}
            className={styles.card}
          >
            <div className={styles.iconWrapper}>
              <HiCollection />
            </div>
            <h2 className={styles.cardTitle}>{series.name}</h2>
            <div className={styles.cardMeta}>
              <span className={styles.count}>{series.count}개의 포스트</span>
              <span className={styles.date}>
                마지막 업데이트: {new Date(series.lastUpdated).toLocaleDateString()}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
