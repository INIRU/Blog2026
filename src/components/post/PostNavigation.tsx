import Link from 'next/link';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi';
import styles from '@/styles/components/post/PostNavigation.module.css';

interface NavPost {
  slug: string;
  title: string;
}

interface PostNavigationProps {
  prevPost: NavPost | null;
  nextPost: NavPost | null;
}

export function PostNavigation({ prevPost, nextPost }: PostNavigationProps) {
  if (!prevPost && !nextPost) return null;

  return (
    <nav className={styles.nav}>
      {prevPost ? (
        <Link href={`/posts/${prevPost.slug}`} className={styles.link}>
          <span className={styles.label}>
            <HiArrowLeft />
            이전 글
          </span>
          <span className={styles.title}>{prevPost.title}</span>
        </Link>
      ) : (
        <div />
      )}

      {nextPost ? (
        <Link href={`/posts/${nextPost.slug}`} className={`${styles.link} ${styles.next}`}>
          <span className={styles.label}>
            다음 글
            <HiArrowRight />
          </span>
          <span className={styles.title}>{nextPost.title}</span>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
