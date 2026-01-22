import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/components/post/RelatedPosts.module.css';

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  published_at: string | null;
}

interface RelatedPostsProps {
  posts: RelatedPost[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  return (
    <section className={styles.section}>
      <h3 className={styles.title}>관련 글</h3>
      <div className={styles.grid}>
        {posts.map((post) => (
          <Link key={post.id} href={`/posts/${post.slug}`} className={styles.card}>
            {post.thumbnail_url && (
              <div className={styles.imageWrapper}>
                <Image
                  src={post.thumbnail_url}
                  alt={post.title}
                  fill
                  className={styles.image}
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
            )}
            <h4 className={styles.postTitle}>{post.title}</h4>
            {post.published_at && (
              <time className={styles.date}>
                {new Date(post.published_at).toLocaleDateString('ko-KR')}
              </time>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
