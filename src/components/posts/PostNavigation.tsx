import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface NavPost {
  title: string;
  slug: string;
}

interface PostNavigationProps {
  prev: NavPost | null;
  next: NavPost | null;
}

export function PostNavigation({ prev, next }: PostNavigationProps) {
  if (!prev && !next) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        marginTop: 64,
        borderTop: "1px solid var(--color-border)",
        paddingTop: 32,
      }}
    >
      {/* Previous */}
      {prev ? (
        <Link
          href={`/posts/${prev.slug}`}
          style={{
            flex: 1,
            padding: 20,
            textDecoration: "none",
            borderRadius: 12,
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            transition: "border-color 0.2s, background 0.2s, transform 0.2s",
          }}
          className="hover:!border-[var(--color-border-hover)] hover:!bg-[var(--color-surface-hover)] hover:!-translate-y-0.5"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 6,
            }}
          >
            <ArrowLeft size={12} style={{ color: "#64748b" }} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: "#64748b",
              }}
            >
              이전 글
            </span>
          </div>
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--color-text-primary)",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {prev.title}
          </p>
        </Link>
      ) : (
        <div style={{ flex: 1 }} />
      )}

      {/* Next */}
      {next ? (
        <Link
          href={`/posts/${next.slug}`}
          style={{
            flex: 1,
            padding: 20,
            textDecoration: "none",
            textAlign: "right",
            borderRadius: 12,
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            transition: "border-color 0.2s, background 0.2s, transform 0.2s",
          }}
          className="hover:!border-[var(--color-border-hover)] hover:!bg-[var(--color-surface-hover)] hover:!-translate-y-0.5"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 4,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: "#64748b",
              }}
            >
              다음 글
            </span>
            <ArrowRight size={12} style={{ color: "#64748b" }} />
          </div>
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--color-text-primary)",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {next.title}
          </p>
        </Link>
      ) : (
        <div style={{ flex: 1 }} />
      )}
    </div>
  );
}
