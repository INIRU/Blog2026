import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase-server";
import { formatDate } from "@/lib/utils";
import Nav from "@/components/nav/Nav";
import { Tag } from "@/components/ui/Tag";
import { PostDetail } from "@/components/posts/PostDetail";
import { TableOfContents } from "@/components/posts/TableOfContents";
import { SeriesCard } from "@/components/posts/SeriesCard";
import { PostNavigation } from "@/components/posts/PostNavigation";
import { RelatedPosts } from "@/components/posts/RelatedPosts";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerSupabase();

  const { data: post } = await supabase
    .from("posts")
    .select("title, excerpt")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) {
    return { title: "글을 찾을 수 없습니다" };
  }

  return {
    title: `${post.title} | INIRU Blog`,
    description: post.excerpt || undefined,
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createServerSupabase();

  const { data: post } = await supabase
    .from("posts")
    .select("*, category:categories(*), post_tags(tag:tags(*))")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) notFound();

  await supabase
    .from("posts")
    .update({ view_count: post.view_count + 1 })
    .eq("id", post.id);

  let seriesPosts: {
    id: string;
    title: string;
    slug: string;
    series_order: number | null;
  }[] = [];
  if (post.series_id) {
    const { data } = await supabase
      .from("posts")
      .select("id, title, slug, series_order, status")
      .eq("series_id", post.series_id)
      .eq("status", "published")
      .order("series_order");
    seriesPosts = data ?? [];
  }

  let seriesInfo: { name: string; slug: string } | null = null;
  if (post.series_id) {
    const { data } = await supabase
      .from("series")
      .select("name, slug")
      .eq("id", post.series_id)
      .single();
    seriesInfo = data;
  }

  const { data: prevPost } = await supabase
    .from("posts")
    .select("title, slug")
    .eq("status", "published")
    .lt("published_at", post.published_at)
    .order("published_at", { ascending: false })
    .limit(1)
    .single();

  const { data: nextPost } = await supabase
    .from("posts")
    .select("title, slug")
    .eq("status", "published")
    .gt("published_at", post.published_at)
    .order("published_at", { ascending: true })
    .limit(1)
    .single();

  const { data: relatedPosts } = await supabase
    .from("posts")
    .select("title, slug, published_at, category:categories(name)")
    .eq("category_id", post.category_id)
    .eq("status", "published")
    .neq("id", post.id)
    .order("published_at", { ascending: false })
    .limit(3);

  const tags: { name: string; slug: string }[] = (post.post_tags ?? []).map(
    (pt: any) => pt.tag
  );

  return (
    <>
      <Nav />

      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px",
          paddingTop: 100,
          paddingBottom: 80,
        }}
      >
        {/* Back link */}
        <Link
          href="/"
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
          블로그로 돌아가기
        </Link>

        {/* Hero Header */}
        <div
          style={{
            position: "relative",
            marginBottom: 56,
            paddingBottom: 40,
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          {/* Category badge */}
          <span
            style={{
              display: "inline-block",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#3b82f6",
              marginBottom: 20,
            }}
          >
            {post.category?.name}
          </span>

          {/* Title */}
          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 38px)",
              fontWeight: 800,
              color: "var(--color-text-primary)",
              margin: 0,
              marginBottom: 24,
              lineHeight: 1.4,
              letterSpacing: "-0.025em",
              maxWidth: 780,
            }}
          >
            {post.title}
          </h1>

          {/* Meta row */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 12,
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              color: "var(--color-text-muted)",
              marginBottom: tags.length > 0 ? 20 : 0,
            }}
          >
            {post.published_at && (
              <span>{formatDate(post.published_at)}</span>
            )}
            <span style={{ opacity: 0.3 }}>&middot;</span>
            <span>{post.reading_time}분 소요</span>
            <span style={{ opacity: 0.3 }}>&middot;</span>
            <span>{post.view_count + 1}회 조회</span>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
              }}
            >
              {tags.map((tag) => (
                <Tag key={tag.slug}>{tag.name}</Tag>
              ))}
            </div>
          )}
        </div>

        {/* Content + TOC layout */}
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            position: "relative",
          }}
        >
          {/* Series card */}
          {seriesInfo && seriesPosts.length > 0 && (
            <SeriesCard
              series={seriesInfo}
              posts={seriesPosts}
              currentSlug={slug}
            />
          )}

          {/* Markdown content */}
          <PostDetail content={post.content} />

          {/* TOC — positioned outside content flow */}
          <aside
            style={{
              position: "absolute",
              left: "calc(100% + 48px)",
              top: 0,
              width: 200,
            }}
            className="hidden xl:block"
          >
            <TableOfContents content={post.content} />
          </aside>
        </div>

        {/* Post navigation */}
        <div style={{ maxWidth: 720, margin: "48px auto 0" }}>
          <PostNavigation prev={prevPost ?? null} next={nextPost ?? null} />
        </div>

        {/* Related posts */}
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <RelatedPosts
            posts={
              (relatedPosts ?? []).map((p: any) => ({
                title: p.title,
                slug: p.slug,
                category: p.category,
                published_at: p.published_at,
              }))
            }
          />
        </div>
      </main>
    </>
  );
}
