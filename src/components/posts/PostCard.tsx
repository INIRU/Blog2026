"use client";

import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface PostCardProps {
  post: {
    title: string;
    slug: string;
    category: { name: string };
    published_at: string | null;
    reading_time: number;
  };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        flex: 1,
      }}
    >
      <article
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          padding: 16,
          transition: "border-color 0.2s ease, background-color 0.2s ease",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.2)";
          e.currentTarget.style.backgroundColor = "var(--color-surface-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--color-border)";
          e.currentTarget.style.backgroundColor = "var(--color-surface)";
        }}
      >
        {/* Category */}
        <span
          style={{
            fontSize: 9,
            fontWeight: 600,
            color: "var(--color-primary-light, #60a5fa)",
            marginBottom: 8,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          {post.category.name}
        </span>

        {/* Title */}
        <h3
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--color-text-primary)",
            lineHeight: 1.4,
            margin: 0,
            marginBlockEnd: 8,
            flex: 1,
          }}
        >
          {post.title}
        </h3>

        {/* Meta */}
        <p
          style={{
            fontSize: 10,
            color: "var(--color-text-muted)",
            margin: 0,
          }}
        >
          {post.published_at ? formatDate(post.published_at) : "임시저장"}
        </p>
      </article>
    </Link>
  );
}
