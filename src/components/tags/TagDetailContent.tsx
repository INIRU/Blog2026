'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PostCard } from '@/components/post/PostCard';
import { HiArrowLeft } from 'react-icons/hi';
import type { Post } from '@/lib/supabase/database.types';
import styles from '@/styles/pages/tags/tag.module.css';

interface TagDetailContentProps {
  tag: string;
  posts: Post[];
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
      staggerChildren: 0.08,
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

export function TagDetailContent({ tag, posts }: TagDetailContentProps) {
  return (
    <motion.div 
      className={styles.container}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.header className={styles.header} variants={itemVariants}>
        <Link href="/tags" className={styles.backLink}>
          <HiArrowLeft />
          <span>모든 태그</span>
        </Link>
        <h1 className={styles.title}>#{tag}</h1>
        <p className={styles.description}>{posts.length}개의 글</p>
      </motion.header>

      {posts.length > 0 ? (
        <motion.div 
          className={styles.postsGrid}
          variants={gridVariants}
        >
          {posts.map((post) => (
            <motion.div key={post.id} variants={cardVariants}>
              <PostCard post={post} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div className={styles.empty} variants={itemVariants}>
          <p>이 태그로 작성된 글이 없습니다.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
