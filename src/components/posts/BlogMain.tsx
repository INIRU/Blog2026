"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { gsap } from "@/lib/gsap-init";
import Nav from "@/components/nav/Nav";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CategoryFilter } from "@/components/posts/CategoryFilter";
import { HeroPost } from "@/components/posts/HeroPost";
import { PostCard } from "@/components/posts/PostCard";
import type { Category, Post, Tag } from "@/lib/types";

type PostWithCategory = Post & { category: Category; tags: Tag[] };

interface BlogMainProps {
  initialPosts: PostWithCategory[];
  categories: Category[];
  initialCategory: string | null;
  initialQuery: string;
}

export function BlogMain({
  initialPosts,
  categories,
  initialCategory,
  initialQuery,
}: BlogMainProps) {
  const { isDark } = useTheme();
  const mainRef = useRef<HTMLElement>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(
    initialCategory
  );
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  useEffect(() => {
    if (!mainRef.current) return;
    const cards = mainRef.current.querySelectorAll("[data-animate]");
    gsap.fromTo(
      cards,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power2.out", delay: 0.3 }
    );
  }, []);

  const filteredPosts = useMemo(() => {
    let posts = initialPosts;

    if (activeCategory) {
      posts = posts.filter((p) => p.category.slug === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some((t) => t.name.toLowerCase().includes(q)))
      );
    }

    return posts;
  }, [initialPosts, activeCategory, searchQuery]);

  const heroPost = filteredPosts[0] ?? null;
  const sidePosts = filteredPosts.slice(1, 3);
  const remainingPosts = filteredPosts.slice(3);

  return (
    <>
      <Nav />

      {/* Background orbs */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "50%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: isDark
              ? "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(37,99,235,0.04) 0%, transparent 70%)",
            animation: "orbDrift1 20s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: "-10%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: isDark
              ? "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(139,92,246,0.03) 0%, transparent 70%)",
            animation: "orbDrift2 25s ease-in-out infinite",
          }}
        />
      </div>

      {/* Main content */}
      <main
        ref={mainRef}
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1100,
          margin: "0 auto",
          padding: "128px 24px 80px",
        }}
      >
        {/* Section header */}
        <div style={{ marginBottom: 40 }} data-animate>
          <SectionHeader label="BLOG" title="Latest Posts" />
        </div>

        {/* Filters row */}
        <div
          data-animate
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <CategoryFilter
            categories={categories}
            activeSlug={activeCategory}
            onChange={setActiveCategory}
          />

          {/* Search bar */}
          <div
            style={{
              marginLeft: "auto",
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Search
              size={13}
              style={{
                position: "absolute",
                left: 12,
                color: "var(--color-text-muted)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="글 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                fontSize: 12,
                padding: "7px 12px 7px 32px",
                borderRadius: 9999,
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-primary)",
                outline: "none",
                width: 200,
                transition: "border-color 0.2s ease",
                fontFamily: "inherit",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.3)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            />
          </div>
        </div>

        {/* Posts */}
        {filteredPosts.length === 0 ? (
          <div
            data-animate
            style={{
              textAlign: "center",
              padding: "80px 0",
              color: "var(--color-text-muted)",
              fontSize: 14,
            }}
          >
            글을 찾을 수 없습니다.
          </div>
        ) : (
          <>
            {/* Magazine layout */}
            <div
              data-animate
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr",
                gridTemplateRows: "1fr 1fr",
                gap: 16,
                marginBottom: remainingPosts.length > 0 ? 16 : 0,
              }}
              className="blog-magazine-grid"
            >
              {heroPost && <HeroPost post={heroPost} />}

              {sidePosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}

              {/* Fill empty side slot if only 1 side post */}
              {sidePosts.length === 1 && <div />}
            </div>

            {/* Remaining posts grid */}
            {remainingPosts.length > 0 && (
              <div
                data-animate
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 16,
                }}
                className="blog-remaining-grid"
              >
                {remainingPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
