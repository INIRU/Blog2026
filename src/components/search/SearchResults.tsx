import { motion, AnimatePresence } from 'framer-motion';
import { PostCard } from '@/components/post/PostCard';
import type { Post } from '@/lib/supabase/database.types';
import styles from '@/styles/pages/search/page.module.css';

interface SearchResultsProps {
  results: Post[];
  isLoading: boolean;
  hasSearched: boolean;
  query: string;
}

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

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
};

export function SearchResults({ results, isLoading, hasSearched, query }: SearchResultsProps) {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div 
          key="loading"
          className={styles.loading}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          검색 중...
        </motion.div>
      ) : hasSearched ? (
        results.length > 0 ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.p className={styles.resultCount} variants={itemVariants}>
              &quot;{query}&quot; 검색 결과 {results.length}개
            </motion.p>
            <motion.div 
              className={styles.results}
              variants={gridVariants}
              initial="initial"
              animate="animate"
            >
              {results.map((post) => (
                <motion.div key={post.id} variants={cardVariants}>
                  <PostCard post={post} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="empty"
            className={styles.empty}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <p>&quot;{query}&quot;에 대한 검색 결과가 없습니다.</p>
          </motion.div>
        )
      ) : null}
    </AnimatePresence>
  );
}
