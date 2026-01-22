'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown, HiBookOpen } from 'react-icons/hi';
import styles from '@/styles/components/post/SeriesNavigation.module.css';

interface SeriesPost {
  slug: string;
  title: string;
  series_order: number;
}

interface SeriesNavigationProps {
  seriesName: string;
  currentSlug: string;
  posts: SeriesPost[];
}

export function SeriesNavigation({ seriesName, currentSlug, posts }: SeriesNavigationProps) {
  const [isOpen, setIsOpen] = useState(true);
  const currentIndex = posts.findIndex((p) => p.slug === currentSlug);

  return (
    <div className={styles.container}>
      <button 
        className={styles.header}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.headerLeft}>
          <HiBookOpen className={styles.icon} />
          <div className={styles.headerInfo}>
            <span className={styles.label}>시리즈</span>
            <span className={styles.name}>{seriesName}</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.progress}>
            {currentIndex + 1} / {posts.length}
          </span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <HiChevronDown className={styles.chevron} />
          </motion.span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.listWrapper}
          >
            <ul className={styles.list}>
              {posts.map((post, index) => (
                <li key={post.slug}>
                  <Link
                    href={`/posts/${post.slug}`}
                    className={`${styles.item} ${post.slug === currentSlug ? styles.current : ''}`}
                  >
                    <span className={styles.order}>{index + 1}</span>
                    <span className={styles.title}>{post.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
