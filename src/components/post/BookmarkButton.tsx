'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiBookmark, HiOutlineBookmark } from 'react-icons/hi';
import { useToast } from '@/components/ui/Toast';
import styles from '@/styles/components/post/BookmarkButton.module.css';

interface BookmarkButtonProps {
  postId: string;
  title: string;
}

interface BookmarkItem {
  id: string;
  title: string;
  savedAt: string;
}

const STORAGE_KEY = 'blog_bookmarks';

function getBookmarks(): BookmarkItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function setBookmarks(bookmarks: BookmarkItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

export function BookmarkButton({ postId, title }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const bookmarks = getBookmarks();
    setBookmarked(bookmarks.some((b) => b.id === postId));
  }, [postId]);

  const handleToggle = () => {
    const bookmarks = getBookmarks();
    
    if (bookmarked) {
      const newBookmarks = bookmarks.filter((b) => b.id !== postId);
      setBookmarks(newBookmarks);
      setBookmarked(false);
      showToast('북마크가 해제되었습니다.', 'info');
    } else {
      const newBookmark: BookmarkItem = {
        id: postId,
        title,
        savedAt: new Date().toISOString(),
      };
      setBookmarks([...bookmarks, newBookmark]);
      setBookmarked(true);
      showToast('북마크에 저장되었습니다.', 'success');
    }
  };

  return (
    <button
      className={`${styles.button} ${bookmarked ? styles.bookmarked : ''}`}
      onClick={handleToggle}
      aria-label={bookmarked ? '북마크 해제' : '북마크 저장'}
    >
      <AnimatePresence mode="wait">
        {bookmarked ? (
          <motion.span
            key="filled"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            className={styles.iconWrapper}
          >
            <HiBookmark className={styles.icon} />
          </motion.span>
        ) : (
          <motion.span
            key="outline"
            initial={{ scale: 1 }}
            exit={{ scale: 0 }}
            className={styles.iconWrapper}
          >
            <HiOutlineBookmark className={styles.icon} />
          </motion.span>
        )}
      </AnimatePresence>
      <span>{bookmarked ? '저장됨' : '저장'}</span>
    </button>
  );
}
