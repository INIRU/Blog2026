import Link from 'next/link';
import Image from 'next/image';
import type { Post } from '@/lib/supabase/database.types';
import { HiArrowLeft, HiClock, HiEye } from 'react-icons/hi';
import { estimateReadingTime, formatKoDate } from '@/lib/post/postUtils';
import styles from '@/styles/components/post/PostHeader.module.css';

interface PostHeaderProps {
  post: Post;
}

export function PostHeader({ post }: PostHeaderProps) {
  const formattedDate = formatKoDate(post.published_at);
  const readingTime = estimateReadingTime(post.content);

  return (
    <header className={styles.header}>
      <Link href="/posts" className={styles.backLink}>
        <HiArrowLeft />
        <span>목록으로</span>
      </Link>

      <div className={styles.tags}>
        {post.tags?.map((tag) => (
          <Link
            key={tag}
            href={`/posts?tag=${encodeURIComponent(tag)}`}
            className={styles.tag}
          >
            {tag}
          </Link>
        ))}
      </div>

      <h1 className={styles.title}>{post.title}</h1>
      
      <p className={styles.excerpt}>{post.excerpt}</p>

      <div className={styles.meta}>
        <time className={styles.date}>{formattedDate}</time>
        <span className={styles.divider}>·</span>
        <span className={styles.readingTime}>
          <HiClock />
          {readingTime}분
        </span>
        {post.view_count > 0 && (
          <>
            <span className={styles.divider}>·</span>
            <span className={styles.views}>
              <HiEye />
              {post.view_count}
            </span>
          </>
        )}
      </div>

      {post.thumbnail_url && (
        <div className={styles.thumbnail}>
          <Image
            src={post.thumbnail_url}
            alt={post.title}
            fill
            className={styles.thumbnailImage}
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
        </div>
      )}
    </header>
  );
}
