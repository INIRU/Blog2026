"use client";

import { useTOC } from "@/hooks/useTOC";

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const { headings, activeId } = useTOC(content);

  if (headings.length === 0) return null;

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      style={{
        position: "sticky",
        top: 96,
      }}
      className="hidden lg:block"
    >
      {/* Title */}
      <p
        style={{
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: "#3b82f6",
          margin: 0,
          marginBottom: 16,
          lineHeight: 1,
        }}
      >
        목차
      </p>

      {/* Heading list */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          const isH3 = heading.level === 3;

          return (
            <button
              key={heading.id}
              onClick={() => handleClick(heading.id)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                borderLeft: `2px solid ${isActive ? "#3b82f6" : "var(--color-border)"}`,
                paddingLeft: isH3 ? 24 : 10,
                paddingTop: 4,
                paddingBottom: 4,
                fontSize: 11,
                lineHeight: 1.5,
                color: isActive ? "#60a5fa" : "#64748b",
                fontWeight: isActive ? 600 : 400,
                fontFamily: "inherit",
                transition: "color 0.2s, border-color 0.2s",
              }}
            >
              {heading.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
