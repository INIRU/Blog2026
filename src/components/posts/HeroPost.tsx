"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/lib/theme";
import { formatDate } from "@/lib/utils";

interface HeroPostProps {
  post: {
    title: string;
    slug: string;
    excerpt: string | null;
    category: { name: string };
    published_at: string | null;
    reading_time: number;
    thumbnail_url: string | null;
  };
}

export function HeroPost({ post }: HeroPostProps) {
  const { isDark } = useTheme();

  const titleGradient = isDark
    ? "linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)"
    : "linear-gradient(135deg, #0f172a 0%, #334155 100%)";

  return (
    <Link
      href={`/posts/${post.slug}`}
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        gridRow: "span 2",
      }}
    >
      <article
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 16,
          overflow: "hidden",
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
        {/* Thumbnail area */}
        <div
          style={{
            height: 240,
            position: "relative",
            background: isDark
              ? "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.12), rgba(14,165,233,0.08))"
              : "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.08), rgba(14,165,233,0.05))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {post.thumbnail_url ? (
            <Image
              src={post.thumbnail_url}
              alt={post.title}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 660px"
            />
          ) : (
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                color: "var(--color-text-muted)",
              }}
            >
              &lt;/&gt;
            </div>
          )}

          {/* Category badge */}
          <span
            style={{
              position: "absolute",
              bottom: 12,
              left: 12,
              fontSize: 10,
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: 6,
              backgroundColor: "rgba(0, 0, 0, 0.45)",
              backdropFilter: "blur(12px) saturate(180%)",
              WebkitBackdropFilter: "blur(12px) saturate(180%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#e2e8f0",
              letterSpacing: 0.5,
            }}
          >
            {post.category.name}
          </span>
        </div>

        {/* Body */}
        <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Title */}
          <h2
            style={{
              fontSize: 20,
              fontWeight: 800,
              backgroundImage: titleGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1.3,
              margin: 0,
              marginBlockEnd: 12,
            }}
          >
            {post.title}
          </h2>

          {/* Excerpt */}
          {post.excerpt && (
            <p
              style={{
                fontSize: 14,
                color: "var(--color-text-secondary)",
                lineHeight: 1.7,
                margin: 0,
                marginBlockEnd: 12,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                flex: 1,
              }}
            >
              {post.excerpt}
            </p>
          )}

          {/* Meta */}
          <p
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              margin: 0,
              marginTop: post.excerpt ? 0 : "auto",
            }}
          >
            {post.published_at ? formatDate(post.published_at) : "임시저장"}
            {" \u00b7 "}
            {post.reading_time}분 소요
          </p>
        </div>
      </article>
    </Link>
  );
}
