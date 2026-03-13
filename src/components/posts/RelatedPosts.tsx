import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface RelatedPost {
  title: string;
  slug: string;
  category: { name: string };
  published_at: string | null;
}

interface RelatedPostsProps {
  posts: RelatedPost[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section style={{ marginTop: 64 }}>
      {/* Section header */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            width: 20,
            height: 2,
            backgroundColor: "#3b82f6",
            marginBottom: 12,
          }}
        />
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 5,
            textTransform: "uppercase",
            color: "#3b82f6",
            margin: 0,
            lineHeight: 1,
          }}
        >
          관련 글
        </p>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}
        className="!grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-3"
      >
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            style={{
              display: "block",
              padding: 20,
              borderRadius: 12,
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
              textDecoration: "none",
              transition: "border-color 0.2s, background 0.2s, transform 0.2s",
            }}
            className="hover:!border-[var(--color-border-hover)] hover:!bg-[var(--color-surface-hover)] hover:!-translate-y-0.5"
          >
            {/* Category */}
            <span
              style={{
                display: "inline-block",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: "#3b82f6",
                marginBottom: 8,
              }}
            >
              {post.category.name}
            </span>

            {/* Title */}
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-text-primary)",
                margin: 0,
                marginBottom: 8,
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {post.title}
            </p>

            {/* Date */}
            {post.published_at && (
              <span
                style={{
                  fontSize: 11,
                  color: "#64748b",
                }}
              >
                {formatDate(post.published_at)}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
