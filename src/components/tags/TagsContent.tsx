'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from '@/styles/pages/tags/page.module.css';

interface TagsContentProps {
  tags: { tag: string; count: number }[];
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
    transition: { duration: 0.4, ease: 'easeOut' }
  },
};

const gridVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const tagVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
};

export function TagsContent({ tags }: TagsContentProps) {
  return (
    <motion.div 
      className={styles.container}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div className={styles.header} variants={itemVariants}>
        <div className={styles.kicker}>Tags</div>
        <h1 className={styles.title}>태그</h1>
        <p className={styles.description}>
          총 {tags.length}개의 태그를 탐색할 수 있어요.
        </p>
      </motion.div>

      {tags.length > 0 ? (
        <motion.div 
          className={styles.grid}
          variants={gridVariants}
        >
          {tags.map(({ tag, count }) => (
            <motion.div key={tag} variants={tagVariants}>
              <Link
                href={`/tags/${encodeURIComponent(tag)}`}
                className={styles.card}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.tagName}>{tag}</span>
                  <div className={styles.iconWrapper}>
                    <div className={styles.icon} />
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.tagCount}>{count} Articles</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div className={styles.empty} variants={itemVariants}>
          <p>아직 태그가 없습니다.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
