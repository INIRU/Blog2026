'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PostCard } from '@/components/post/PostCard';
import { HiArrowRight } from 'react-icons/hi';
import type { Post } from '@/lib/supabase/database.types';
import styles from '@/styles/pages/page.module.css';

interface HomeContentProps {
  recentPosts: Post[];
  popularTags: { tag: string; count: number }[];
}

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
};

const gridVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
};

export function HomeContent({ recentPosts, popularTags }: HomeContentProps) {
  return (
    <motion.div 
      className={styles.container}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.section className={styles.hero} variants={itemVariants}>
        <p className={styles.heroKicker}>Technical journal / INIRU.blog</p>
        <h1 className={styles.heroTitle}>
          개발하면서 마주친 문제와 판단을 기록합니다.
        </h1>
        <p className={styles.heroDescription}>
          React, Next.js, TypeScript를 중심으로 구현 과정, 디버깅 근거, 설계 선택을 남기는 개발 블로그입니다.
        </p>
        <div className={styles.heroActions}>
          <Link href="/posts" className={styles.primaryButton}>
            모든 글 보기
            <HiArrowRight />
          </Link>
        </div>
      </motion.section>

      <motion.section className={styles.section} variants={itemVariants}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>최근 글</h2>
          <Link href="/posts" className={styles.viewAll}>
            전체 보기 <HiArrowRight />
          </Link>
        </div>
        
        {recentPosts.length > 0 ? (
          <motion.div 
            className={styles.postsGrid}
            variants={gridVariants}
          >
            {recentPosts.map((post, index) => (
              <motion.div key={post.id} variants={cardVariants}>
                <PostCard post={post} priority={index < 2} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className={styles.emptyState}>
            <p>아직 작성된 글이 없습니다.</p>
          </div>
        )}
      </motion.section>

      {popularTags.length > 0 && (
        <motion.section className={styles.section} variants={itemVariants}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>인기 태그</h2>
            <Link href="/tags" className={styles.viewAll}>
              전체 보기 <HiArrowRight />
            </Link>
          </div>
          <motion.div 
            className={styles.tagCloud}
            variants={gridVariants}
          >
            {popularTags.map(({ tag, count }) => (
              <motion.div
                key={tag}
                variants={cardVariants}
              >
                <Link
                  href={`/tags/${encodeURIComponent(tag)}`}
                  className={styles.tag}
                >
                  {tag}
                  <span className={styles.tagCount}>{count}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      )}
    </motion.div>
  );
}
