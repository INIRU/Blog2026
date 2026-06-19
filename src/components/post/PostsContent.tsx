'use client';

import Link from 'next/link';
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
  currentSort?: string;
  totalPublished: number;
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

export function PostsContent({
  posts,
  total,
  totalPages,
  currentPage,
  currentTag,
  allTags,
  searchQuery,
  currentSort,
  totalPublished,
}: PostsContentProps) {
  const hasActiveFilter = Boolean(currentTag || searchQuery);
  const sortLabel =
    currentSort === 'oldest' ? '오래된순' : currentSort === 'popular' ? '조회수순' : '최신순';

  const getDescription = () => {
    if (searchQuery && currentTag) {
      return `"${searchQuery}" 검색과 "${currentTag}" 태그를 적용한 결과 ${total}개`;
    }
    if (currentTag) {
      return `"${currentTag}" 태그가 포함된 글 ${total}개`;
    }
    if (searchQuery) {
      return `"${searchQuery}" 검색 결과 ${total}개`;
    }
    return `총 ${total}개의 글`;
  };

  const createPageHref = (page: number) => {
    const params = new URLSearchParams();

    if (currentTag) params.set('tag', currentTag);
    if (searchQuery) params.set('q', searchQuery);
    if (currentSort && currentSort !== 'latest') params.set('sort', currentSort);
    if (page > 1) params.set('page', String(page));

    const query = params.toString();
    return query ? `/posts?${query}` : '/posts';
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
        <div className={styles.summaryBar} aria-live="polite">
          <span>공개 글 {totalPublished}개</span>
          <span>현재 결과 {total}개</span>
          <span>정렬 {sortLabel}</span>
          {hasActiveFilter && <span>필터 적용 중</span>}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <PostsFilter
          key={`${currentTag ?? ''}:${searchQuery ?? ''}:${currentSort ?? 'latest'}`}
          tags={allTags}
          currentTag={currentTag}
          totalPublished={totalPublished}
          resultCount={total}
        />
      </motion.div>

      {posts.length > 0 ? (
        <>
          <motion.div 
            className={styles.postsGrid}
            variants={gridVariants}
          >
            {posts.map((post, index) => (
              <motion.div key={post.id} variants={cardVariants}>
                <PostCard post={post} priority={index < 2} />
              </motion.div>
            ))}
          </motion.div>

          {totalPages > 1 && (
            <motion.div className={styles.pagination} variants={itemVariants}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={createPageHref(page)}
                  className={`${styles.pageLink} ${
                    page === currentPage ? styles.active : ''
                  }`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </Link>
              ))}
            </motion.div>
          )}
        </>
      ) : (
        <motion.div className={styles.emptyState} variants={itemVariants}>
          <h2>{hasActiveFilter ? '조건에 맞는 글이 없습니다.' : '아직 공개된 글이 없습니다.'}</h2>
          <p>
            {hasActiveFilter
              ? `공개 글 ${totalPublished}개 중 현재 검색/태그 조건과 일치하는 글이 없습니다. 필터를 지우면 전체 공개 글을 볼 수 있습니다.`
              : '게시된 글이 생기면 이 목록에 최신순으로 표시됩니다.'}
          </p>
          {hasActiveFilter && (
            <Link href="/posts" className={styles.clearFilters}>
              전체 공개 글 보기
            </Link>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
