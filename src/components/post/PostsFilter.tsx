'use client';

import { useRouter } from 'next/navigation';
import styles from '@/styles/components/post/PostsFilter.module.css';

interface PostsFilterProps {
  tags: string[];
  currentTag?: string;
}

export function PostsFilter({ tags, currentTag }: PostsFilterProps) {
  const router = useRouter();

  const handleTagChange = (tag: string) => {
    if (tag === '') {
      router.push('/posts');
    } else {
      router.push(`/posts?tag=${encodeURIComponent(tag)}`);
    }
  };

  return (
    <div className={styles.filter}>
      <button
        className={`${styles.filterButton} ${!currentTag ? styles.active : ''}`}
        onClick={() => handleTagChange('')}
      >
        전체
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          className={`${styles.filterButton} ${
            currentTag === tag ? styles.active : ''
          }`}
          onClick={() => handleTagChange(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
