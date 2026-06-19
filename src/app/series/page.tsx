import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { HiArrowRight } from 'react-icons/hi';
import { formatKoDate } from '@/lib/post/postUtils';
import styles from '@/styles/pages/series/page.module.css';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Series',
  description: '주제별로 연재된 글들을 모아보세요.',
  openGraph: {
    title: 'Series | INIRU Blog',
    description: '주제별로 연재된 글들을 모아보세요.',
    url: 'https://blog.iniru.xyz/series',
    type: 'website',
  },
  alternates: {
    canonical: 'https://blog.iniru.xyz/series',
  },
};

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
  const latestTimestamp = seriesList.reduce((latest, series) => {
    const current = new Date(series.lastUpdated).getTime();
    return current > latest ? current : latest;
  }, 0);
  const latestDate = latestTimestamp ? new Date(latestTimestamp) : null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerContent}>
            <span className={styles.kicker}>Series</span>
            <h1 className={styles.title}>시리즈</h1>
            <p className={styles.description}>
              주제별로 묶인 글을 따라가며 깊이 있게 읽어보세요.
            </p>
          </div>
          <div className={styles.statsPanel}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{seriesList.length}</span>
              <span className={styles.statLabel}>Series</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {latestDate ? formatKoDate(latestDate) : '-'}
              </span>
              <span className={styles.statLabel}>Updated</span>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.list}>
        {seriesList.length > 0 ? seriesList.map((series, index) => (
          <Link
            key={series.name}
            href={`/series/${encodeURIComponent(series.name)}`}
            className={styles.row}
          >
            <div className={styles.index}>
              {(index + 1).toString().padStart(2, '0')}
            </div>
            
            <div className={styles.content}>
              <span className={styles.label}>SERIES</span>
              <h2 className={styles.seriesName}>{series.name}</h2>
              <div className={styles.meta}>
                <span className={styles.count}>{series.count} Articles</span>
                <span className={styles.separator}>/</span>
                <span className={styles.date}>
                  Updated {formatKoDate(series.lastUpdated)}
                </span>
              </div>
            </div>

            <div className={styles.arrow}>
              <HiArrowRight size={32} />
            </div>
          </Link>
        )) : (
          <div className={styles.emptyState}>
            <h2>아직 공개된 시리즈가 없습니다.</h2>
            <p>공개 글은 있어도 `series_name`이 연결된 글이 없으면 이 화면에는 표시되지 않습니다.</p>
            <Link href="/posts" className={styles.emptyLink}>
              공개 글 전체 보기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
