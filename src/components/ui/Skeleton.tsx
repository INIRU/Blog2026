'use client';

import styles from '@/styles/components/ui/Skeleton.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

export function Skeleton({ width, height, borderRadius, className }: SkeletonProps) {
  return (
    <div
      className={`${styles.skeleton} ${className || ''}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
      }}
    />
  );
}

export function PostCardSkeleton() {
  return (
    <div className={styles.postCard}>
      <Skeleton className={styles.thumbnail} borderRadius={12} />
      <div className={styles.content}>
        <div className={styles.tags}>
          <Skeleton width={60} height={24} borderRadius={12} />
          <Skeleton width={80} height={24} borderRadius={12} />
        </div>
        <Skeleton width="90%" height={28} borderRadius={4} />
        <Skeleton width="100%" height={20} borderRadius={4} />
        <Skeleton width="70%" height={20} borderRadius={4} />
        <div className={styles.meta}>
          <Skeleton width={100} height={16} borderRadius={4} />
          <Skeleton width={60} height={16} borderRadius={4} />
        </div>
      </div>
    </div>
  );
}

export function PostListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className={styles.postList}>
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PostDetailSkeleton() {
  return (
    <div className={styles.postDetail}>
      <div className={styles.header}>
        <div className={styles.detailTags}>
          <Skeleton width={70} height={28} borderRadius={14} />
          <Skeleton width={90} height={28} borderRadius={14} />
          <Skeleton width={60} height={28} borderRadius={14} />
        </div>
        <Skeleton width="80%" height={48} borderRadius={4} />
        <Skeleton width="60%" height={24} borderRadius={4} />
        <div className={styles.detailMeta}>
          <Skeleton width={120} height={20} borderRadius={4} />
          <Skeleton width={80} height={20} borderRadius={4} />
        </div>
      </div>
      <div className={styles.body}>
        <Skeleton width="100%" height={24} borderRadius={4} />
        <Skeleton width="95%" height={24} borderRadius={4} />
        <Skeleton width="100%" height={24} borderRadius={4} />
        <Skeleton width="85%" height={24} borderRadius={4} />
        <Skeleton width="100%" height={200} borderRadius={8} />
        <Skeleton width="100%" height={24} borderRadius={4} />
        <Skeleton width="90%" height={24} borderRadius={4} />
        <Skeleton width="100%" height={24} borderRadius={4} />
        <Skeleton width="75%" height={24} borderRadius={4} />
      </div>
    </div>
  );
}
