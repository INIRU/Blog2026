'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiEye, HiHeart, HiDocumentText, HiTrendingUp } from 'react-icons/hi';
import type { Post } from '@/lib/supabase/database.types';
import styles from '@/styles/components/admin/StatsDashboard.module.css';

interface StatsDashboardProps {
  posts: Post[];
}

interface StatItem {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export function StatsDashboard({ posts }: StatsDashboardProps) {
  const stats = useMemo(() => {
    const totalViews = posts.reduce((sum, post) => sum + post.view_count, 0);
    const totalLikes = posts.reduce((sum, post) => sum + post.like_count, 0);
    const publishedCount = posts.filter((p) => p.published).length;
    const avgViews = publishedCount > 0 ? Math.round(totalViews / publishedCount) : 0;

    return { totalViews, totalLikes, publishedCount, avgViews };
  }, [posts]);

  const topPosts = useMemo(() => {
    return [...posts]
      .filter((p) => p.published)
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, 5);
  }, [posts]);

  const statItems: StatItem[] = [
    {
      label: '총 조회수',
      value: stats.totalViews.toLocaleString(),
      icon: <HiEye />,
      color: 'blue',
    },
    {
      label: '총 좋아요',
      value: stats.totalLikes.toLocaleString(),
      icon: <HiHeart />,
      color: 'red',
    },
    {
      label: '발행된 글',
      value: stats.publishedCount,
      icon: <HiDocumentText />,
      color: 'green',
    },
    {
      label: '평균 조회수',
      value: stats.avgViews.toLocaleString(),
      icon: <HiTrendingUp />,
      color: 'purple',
    },
  ];

  return (
    <motion.div
      className={styles.dashboard}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div className={styles.statsGrid} variants={itemVariants}>
        {statItems.map((item) => (
          <div key={item.label} className={`${styles.statCard} ${styles[item.color]}`}>
            <div className={styles.statIcon}>{item.icon}</div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{item.value}</span>
              <span className={styles.statLabel}>{item.label}</span>
            </div>
          </div>
        ))}
      </motion.div>

      {topPosts.length > 0 && (
        <motion.div className={styles.topPosts} variants={itemVariants}>
          <h3 className={styles.sectionTitle}>인기 글 Top 5</h3>
          <div className={styles.topPostsList}>
            {topPosts.map((post, index) => (
              <div key={post.id} className={styles.topPostItem}>
                <span className={styles.rank}>{index + 1}</span>
                <div className={styles.topPostInfo}>
                  <span className={styles.topPostTitle}>{post.title}</span>
                  <span className={styles.topPostStats}>
                    조회 {post.view_count.toLocaleString()} · 좋아요 {post.like_count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
