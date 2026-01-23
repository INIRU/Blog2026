'use client';

import { motion } from 'framer-motion';
import { PostCard } from '@/components/post/PostCard';
import { PostsFilter } from '@/components/post/PostsFilter';
import type { Post } from '@/lib/supabase/database.types';
import styles from '@/styles/pages/posts/page.module.css';

interface PostsContentProps {
  posts: Post[];
  total: number;
  totalPages: number;
  currentPage: number;
  currentTag?: string;
  allTags: string[];
  searchQuery?: string;
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

export function PostsContent({ posts, total, totalPages, currentPage, currentTag, allTags, searchQuery }: PostsContentProps) {
  const getDescription = () => {
    if (searchQuery) {
      return `"${searchQuery}" 검색 결과 ${total}개`;
    }
    if (currentTag) {
      return `"${currentTag}" 태그가 포함된 글 ${total}개`;
    }
    return `총 ${total}개의 글`;
  };

  return (
    <motion.div 
      className={styles.container}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div className={styles.header} variants={itemVariants}>
        <h1 className={styles.title}>Posts</h1>
        <p className={styles.description}>
          {getDescription()}
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <PostsFilter tags={allTags} currentTag={currentTag} />
      </motion.div>

      {posts.length > 0 ? (
        <>
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

          {totalPages > 1 && (
            <motion.div className={styles.pagination} variants={itemVariants}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <a
                  key={page}
                  href={`/posts?${currentTag ? `tag=${currentTag}&` : ''}page=${page}`}
                  className={`${styles.pageLink} ${
                    page === currentPage ? styles.active : ''
                  }`}
                >
                  {page}
                </a>
              ))}
            </motion.div>
          )}
        </>
      ) : (
        <motion.div className={styles.emptyState} variants={itemVariants}>
          <p>글이 없습니다.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
