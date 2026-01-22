'use client';

import { motion } from 'framer-motion';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { CommentSection } from '@/components/comment/CommentSection';
import { TableOfContents } from '@/components/post/TableOfContents';
import { PostHeader } from '@/components/post/PostHeader';
import { PostActions } from '@/components/post/PostActions';
import { PostNavigation } from '@/components/post/PostNavigation';
import { SeriesNavigation } from '@/components/post/SeriesNavigation';
import { RelatedPosts } from '@/components/post/RelatedPosts';
import { ReadingProgressBar } from '@/components/post/ReadingProgressBar';
import type { Post } from '@/lib/supabase/database.types';
import styles from '@/styles/pages/posts/slug.module.css';

interface NavPost {
  slug: string;
  title: string;
}

interface SeriesPost {
  slug: string;
  title: string;
  series_order: number;
}

export interface PostDetailContentProps {
  post: Post;
  relatedPosts: {
    id: string;
    title: string;
    slug: string;
    thumbnail_url: string | null;
    published_at: string | null;
  }[];
  prevPost: NavPost | null;
  nextPost: NavPost | null;
  seriesPosts: SeriesPost[] | null;
  isPreview?: boolean;
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
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
};

export function PostDetailContent({ post, relatedPosts, prevPost, nextPost, seriesPosts, isPreview }: PostDetailContentProps) {
  return (
    <>
      <ReadingProgressBar />
      <motion.div 
        className={styles.container}
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.article className={styles.article} variants={itemVariants}>
          <PostHeader post={post} />

        {post.series_name && seriesPosts && seriesPosts.length > 1 && (
          <SeriesNavigation
            seriesName={post.series_name}
            currentSlug={post.slug}
            posts={seriesPosts}
          />
        )}
        
        <motion.div 
          className={styles.contentWrapper}
          variants={itemVariants}
        >
          <aside className={styles.sidebar}>
            <TableOfContents content={post.content} />
          </aside>
          
          <div className={styles.content}>
            <MarkdownRenderer content={post.content} />
            {!isPreview && <PostActions post={post} />}
          </div>
        </motion.div>
      </motion.article>

      {!isPreview && (
        <>
          <motion.div variants={itemVariants}>
            <PostNavigation prevPost={prevPost} nextPost={nextPost} />
          </motion.div>

          {relatedPosts.length > 0 && (
            <motion.div variants={itemVariants}>
              <RelatedPosts posts={relatedPosts} />
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <CommentSection postId={post.id} />
          </motion.div>
        </>
      )}
      </motion.div>
    </>
  );
}
