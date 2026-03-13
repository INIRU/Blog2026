import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase-server";
import Nav from "@/components/nav/Nav";

export const metadata: Metadata = {
  title: "Series | INIRU Blog",
};

interface SeriesWithCount {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  post_count: number;
  preview_posts: { title: string; slug: string }[];
}

export default async function SeriesPage() {
  const supabase = await createServerSupabase();

  const { data: seriesList } = await supabase
    .from("series")
    .select("id, name, slug, description")
    .order("created_at", { ascending: false });

  const series = seriesList ?? [];

  const seriesWithData: SeriesWithCount[] = await Promise.all(
    series.map(async (s) => {
      const [countResult, postsResult] = await Promise.all([
        supabase
          .from("posts")
          .select("id", { count: "exact", head: true })
          .eq("series_id", s.id)
          .eq("status", "published"),
        supabase
          .from("posts")
          .select("title, slug")
          .eq("series_id", s.id)
          .eq("status", "published")
          .order("series_order", { ascending: true })
          .limit(3),
      ]);

      return {
        ...s,
        post_count: countResult.count ?? 0,
        preview_posts: postsResult.data ?? [],
      };
    })
  );

  return (
    <>
      <Nav />
      <main
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "0 24px",
          paddingTop: 100,
          paddingBottom: 80,
        }}
      >
        {/* Page header */}
        <div style={{ marginBottom: 48 }}>
          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 800,
              color: "var(--color-text-primary)",
              margin: 0,
              marginBottom: 12,
              letterSpacing: "-0.03em",
            }}
          >
            Series
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "var(--color-text-muted)",
              margin: 0,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {seriesWithData.length} series
          </p>
        </div>

        {/* Series grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
            gap: 20,
          }}
          className="series-grid"
        >
          {seriesWithData.map((s) => (
            <Link
              key={s.id}
              href={`/series/${s.slug}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface)",
                  borderRadius: 12,
                  padding: 24,
                  transition: "border-color 0.2s, background 0.2s",
                  height: "100%",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "var(--color-border-hover)";
                  el.style.background = "var(--color-surface-hover)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "var(--color-border)";
                  el.style.background = "var(--color-surface)";
                }}
              >
                {/* Series name */}
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    margin: 0,
                    marginBottom: 8,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {s.name}
                </h2>

                {/* Description */}
                {s.description && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--color-text-secondary)",
                      margin: 0,
                      marginBottom: 16,
                      lineHeight: 1.6,
                    }}
                  >
                    {s.description}
                  </p>
                )}

                {/* Post count badge */}
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
                    marginBottom: s.preview_posts.length > 0 ? 16 : 0,
                  }}
                >
                  {s.post_count} posts
                </span>

                {/* Preview posts */}
                {s.preview_posts.length > 0 && (
                  <ul
                    style={{
                      margin: 0,
                      padding: 0,
                      listStyle: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {s.preview_posts.map((p, i) => (
                      <li
                        key={p.slug}
                        style={{
                          fontSize: 12,
                          color: "var(--color-text-muted)",
                          display: "flex",
                          alignItems: "baseline",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 10,
                            color: "var(--color-text-muted)",
                            opacity: 0.6,
                            flexShrink: 0,
                          }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {p.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Link>
          ))}
        </div>

        {seriesWithData.length === 0 && (
          <p
            style={{
              textAlign: "center",
              color: "var(--color-text-muted)",
              fontSize: 14,
              paddingTop: 60,
            }}
          >
            아직 시리즈가 없습니다.
          </p>
        )}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .series-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
