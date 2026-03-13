import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase-server";
import { formatDate } from "@/lib/utils";
import Nav from "@/components/nav/Nav";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerSupabase();

  const { data: series } = await supabase
    .from("series")
    .select("name")
    .eq("slug", slug)
    .single();

  if (!series) {
    return { title: "Series Not Found | INIRU Blog" };
  }

  return {
    title: `${series.name} | INIRU Blog`,
  };
}

export default async function SeriesDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createServerSupabase();

  const { data: series } = await supabase
    .from("series")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .single();

  if (!series) notFound();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, reading_time, published_at, series_order")
    .eq("series_id", series.id)
    .eq("status", "published")
    .order("series_order", { ascending: true });

  const seriesPosts = posts ?? [];

  return (
    <>
      <Nav />
      <main
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "0 24px",
          paddingTop: 100,
          paddingBottom: 80,
        }}
      >
        {/* Back link */}
        <Link
          href="/series"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 500,
            color: "var(--color-text-muted)",
            textDecoration: "none",
            marginBottom: 40,
            transition: "color 0.2s",
          }}
          className="hover:!text-[var(--color-text-primary)]"
        >
          <ArrowLeft size={14} />
          All Series
        </Link>

        {/* Series header */}
        <div
          style={{
            marginBottom: 48,
            paddingBottom: 40,
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(26px, 4vw, 36px)",
              fontWeight: 800,
              color: "var(--color-text-primary)",
              margin: 0,
              marginBottom: series.description ? 16 : 20,
              letterSpacing: "-0.03em",
              lineHeight: 1.3,
            }}
          >
            {series.name}
          </h1>

          {series.description && (
            <p
              style={{
                fontSize: 14,
                color: "var(--color-text-secondary)",
                margin: 0,
                marginBottom: 20,
                lineHeight: 1.7,
              }}
            >
              {series.description}
            </p>
          )}

          <span
            style={{
              display: "inline-block",
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
              color: "#3b82f6",
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.15)",
              borderRadius: 6,
              padding: "3px 8px",
            }}
          >
            {seriesPosts.length} posts
          </span>
        </div>

        {/* Posts list */}
        <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {seriesPosts.map((post, index) => (
            <li
              key={post.id}
              style={{
                borderBottom: "1px solid var(--color-border)",
                paddingBottom: 28,
                marginBottom: 28,
              }}
            >
              <Link
                href={`/posts/${post.slug}`}
                style={{ textDecoration: "none", display: "block" }}
                className="group"
              >
                <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                  {/* Order number */}
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--color-text-muted)",
                      opacity: 0.5,
                      flexShrink: 0,
                      paddingTop: 3,
                      minWidth: 28,
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "var(--color-text-primary)",
                        margin: 0,
                        marginBottom: post.excerpt ? 8 : 12,
                        letterSpacing: "-0.015em",
                        lineHeight: 1.5,
                        transition: "color 0.2s",
                      }}
                      className="group-hover:!text-[var(--color-primary-light)]"
                    >
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--color-text-muted)",
                          margin: 0,
                          marginBottom: 12,
                          lineHeight: 1.6,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {post.excerpt}
                      </p>
                    )}

                    {/* Meta */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontSize: 11,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {post.published_at && (
                        <span>{formatDate(post.published_at)}</span>
                      )}
                      {post.published_at && post.reading_time && (
                        <span style={{ opacity: 0.3 }}>&middot;</span>
                      )}
                      {post.reading_time && (
                        <span>{post.reading_time} min read</span>
                      )}

                      {/* Progress indicator */}
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: 10,
                          color: "#3b82f6",
                          opacity: 0.7,
                          fontWeight: 600,
                        }}
                      >
                        {index + 1} / {seriesPosts.length}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ol>

        {seriesPosts.length === 0 && (
          <p
            style={{
              textAlign: "center",
              color: "var(--color-text-muted)",
              fontSize: 14,
              paddingTop: 40,
            }}
          >
            아직 게시된 글이 없습니다.
          </p>
        )}
      </main>
    </>
  );
}
