import { PostListSkeleton } from '@/components/ui/Skeleton';
import styles from '@/styles/pages/posts/page.module.css';

export default function PostsLoading() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonDescription} />
      </div>
      <PostListSkeleton count={6} />
    </div>
  );
}
