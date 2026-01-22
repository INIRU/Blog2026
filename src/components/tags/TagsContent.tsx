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
        <h1 className={styles.title}>Tags</h1>
        <p className={styles.description}>
          총 {tags.length}개의 태그
        </p>
      </motion.div>

      {tags.length > 0 ? (
        <motion.div 
          className={styles.tagCloud}
          variants={gridVariants}
        >
          {tags.map(({ tag, count }) => (
            <motion.div key={tag} variants={tagVariants}>
              <Link
                href={`/tags/${encodeURIComponent(tag)}`}
                className={styles.tag}
              >
                <span className={styles.tagName}>{tag}</span>
                <span className={styles.tagCount}>{count}</span>
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
