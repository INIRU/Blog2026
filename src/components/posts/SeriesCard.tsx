"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Check } from "lucide-react";

interface SeriesPost {
  id: string;
  title: string;
  slug: string;
  series_order: number | null;
}

interface SeriesCardProps {
  series: { name: string; slug: string };
  posts: SeriesPost[];
  currentSlug: string;
}

export function SeriesCard({ series, posts, currentSlug }: SeriesCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  const sorted = useMemo(
    () =>
      [...posts].sort(
        (a, b) => (a.series_order ?? 0) - (b.series_order ?? 0)
      ),
    [posts]
  );

  const currentIndex = sorted.findIndex((p) => p.slug === currentSlug);
  const total = sorted.length;
  const currentNum = currentIndex + 1;
  const progressPercent = total > 0 ? (currentNum / total) * 100 : 0;

  return (
    <div
      style={{
        backgroundColor: "rgba(59,130,246,0.04)",
        border: "1px solid rgba(59,130,246,0.12)",
        borderRadius: 14,
        padding: 20,
        marginBottom: 24,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Series badge */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: "#3b82f6",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 16,
                height: 16,
                borderRadius: 4,
                backgroundColor: "rgba(59,130,246,0.2)",
                fontSize: 9,
                fontWeight: 800,
                color: "#60a5fa",
              }}
            >
              S
            </span>
            시리즈 &middot; {currentNum} / {total}
          </span>
        </div>

        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "시리즈 펼치기" : "시리즈 접기"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 4,
            border: "none",
            background: "transparent",
            color: "#64748b",
            cursor: "pointer",
            borderRadius: 4,
          }}
        >
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {/* Series name */}
      <p
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "var(--color-text-primary)",
          margin: 0,
          marginBottom: 12,
        }}
      >
        {series.name}
      </p>

      {/* Progress bar */}
      <div
        style={{
          height: 3,
          backgroundColor: "var(--color-border)",
          borderRadius: 2,
          overflow: "hidden",
          marginBottom: collapsed ? 0 : 16,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPercent}%`,
            background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
            borderRadius: 2,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {/* Collapsible list */}
      <div
        style={{
          overflow: "hidden",
          maxHeight: collapsed ? 0 : 1000,
          opacity: collapsed ? 0 : 1,
          transition: "max-height 0.35s ease, opacity 0.25s ease",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {sorted.map((post, idx) => {
            const isDone = idx < currentIndex;
            const isCurrent = post.slug === currentSlug;
            const num = idx + 1;

            const item = (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 4px",
                  borderRadius: 8,
                  transition: "background 0.15s",
                }}
              >
                {/* Number badge */}
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 700,
                    flexShrink: 0,
                    ...(isDone
                      ? {
                          backgroundColor: "rgba(59,130,246,0.2)",
                          color: "#60a5fa",
                        }
                      : isCurrent
                        ? {
                            backgroundColor: "#3b82f6",
                            color: "#ffffff",
                          }
                        : {
                            backgroundColor: "var(--color-surface, rgba(255,255,255,0.025))",
                            color: "#64748b",
                          }),
                  }}
                >
                  {isDone ? <Check size={11} /> : num}
                </span>

                {/* Title */}
                <span
                  style={{
                    fontSize: 11,
                    lineHeight: 1.4,
                    ...(isDone
                      ? { color: "var(--color-text-secondary)" }
                      : isCurrent
                        ? { color: "#3b82f6", fontWeight: 700 }
                        : { color: "#64748b" }),
                  }}
                >
                  {post.title}
                </span>
              </div>
            );

            if (isDone || isCurrent) {
              return (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  {item}
                </Link>
              );
            }

            return (
              <div key={post.id} style={{ opacity: 0.6 }}>
                {item}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
