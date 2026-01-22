import Link from 'next/link';
import Image from 'next/image';
import { HiClock } from 'react-icons/hi2';
import type { Post } from '@/lib/supabase/database.types';
import styles from '@/styles/components/post/PostCard.module.css';

interface PostCardProps {
  post: Post;
}

function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function PostCard({ post }: PostCardProps) {
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const readingTime = estimateReadingTime(post.content);

  return (
    <Link href={`/posts/${post.slug}`} className={styles.card}>
      {post.thumbnail_url && (
        <div className={styles.imageWrapper}>
          <Image
            src={post.thumbnail_url}
            alt={post.title}
            fill
            className={styles.image}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}
      
      <div className={styles.content}>
        {post.tags && post.tags.length > 0 && (
          <div className={styles.tags}>
            {post.tags.slice(0, 2).map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <h3 className={styles.title}>{post.title}</h3>
        
        <p className={styles.excerpt}>{post.excerpt}</p>
        
        <div className={styles.meta}>
          <time className={styles.date}>{formattedDate}</time>
          <span className={styles.separator}>·</span>
          <span className={styles.readingTime}>
              <HiClock />
              {readingTime}분
            </span>
          {post.view_count > 0 && (
            <>
              <span className={styles.separator}>·</span>
              <span className={styles.views}>조회 {post.view_count}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
