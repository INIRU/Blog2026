"use client";

interface CategoryFilterProps {
  categories: { id: string; name: string; slug: string }[];
  activeSlug: string | null;
  onChange: (slug: string | null) => void;
}

export function CategoryFilter({
  categories,
  activeSlug,
  onChange,
}: CategoryFilterProps) {
  const allItems = [
    { id: "__all__", name: "전체", slug: null as string | null },
    ...categories.map((c) => ({ ...c, slug: c.slug as string | null })),
  ];

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      {allItems.map((item) => {
        const isActive = activeSlug === item.slug;

        return (
          <button
            key={item.id}
            onClick={() => onChange(item.slug)}
            style={{
              fontSize: 11,
              fontWeight: 600,
              paddingLeft: 16,
              paddingRight: 16,
              paddingTop: 6,
              paddingBottom: 6,
              borderRadius: 9999,
              border: isActive
                ? "1px solid rgba(59, 130, 246, 0.2)"
                : "1px solid var(--color-border)",
              backgroundColor: isActive
                ? "rgba(59, 130, 246, 0.15)"
                : "transparent",
              color: isActive ? "#60a5fa" : "var(--color-text-muted)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              lineHeight: 1,
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = "var(--color-border-hover)";
                e.currentTarget.style.color = "var(--color-text-secondary)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.color = "var(--color-text-muted)";
              }
            }}
          >
            {item.name}
          </button>
        );
      })}
    </div>
  );
}
