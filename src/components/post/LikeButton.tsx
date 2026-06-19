'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { supabase } from '@/lib/supabase/client';
import styles from '@/styles/components/post/LikeButton.module.css';

interface LikeButtonProps {
  postId: string;
  initialCount: number;
}

const STORAGE_KEY = 'blog_liked_posts';

function getLikedPosts(): string[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function setLikedPosts(posts: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export function LikeButton({ postId, initialCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const likedPosts = getLikedPosts();
    setLiked(likedPosts.includes(postId));
  }, [postId]);

  const handleLike = async () => {
    if (liked || isAnimating) return;

    setIsAnimating(true);
    setLiked(true);
    setCount((prev) => prev + 1);

    const likedPosts = getLikedPosts();
    setLikedPosts([...likedPosts, postId]);

    await supabase.rpc('increment_like_count', { post_id: postId });

    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      className={`${styles.button} ${liked ? styles.liked : ''}`}
      onClick={handleLike}
      disabled={liked}
      aria-label={liked ? '좋아요 완료' : '좋아요'}
    >
      <AnimatePresence mode="wait">
        {liked ? (
          <motion.span
            key="filled"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            className={styles.iconWrapper}
          >
            <HiHeart className={styles.icon} />
          </motion.span>
        ) : (
          <motion.span
            key="outline"
            initial={{ scale: 1 }}
            exit={{ scale: 0 }}
            className={styles.iconWrapper}
          >
            <HiOutlineHeart className={styles.icon} />
          </motion.span>
        )}
      </AnimatePresence>
      <span className={styles.count}>{count}</span>
    </button>
  );
}
