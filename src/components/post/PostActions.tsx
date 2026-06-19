'use client';

import { LikeButton } from './LikeButton';
import { ShareButton } from './ShareButton';
import { BookmarkButton } from './BookmarkButton';
import type { Post } from '@/lib/supabase/database.types';
import styles from '@/styles/components/post/PostActions.module.css';

interface PostActionsProps {
  post: Post;
}

export function PostActions({ post }: PostActionsProps) {
  const url = typeof window !== 'undefined' 
    ? `${window.location.origin}/posts/${post.slug}`
    : `/posts/${post.slug}`;

  return (
    <div className={styles.actions}>
      <LikeButton postId={post.id} initialCount={post.like_count ?? 0} />
      <BookmarkButton postId={post.id} title={post.title} />
      <ShareButton title={post.title} url={url} />
    </div>
  );
}
