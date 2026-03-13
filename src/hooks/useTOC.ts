"use client";

import { useEffect, useState } from "react";

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function useTOC(content: string) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const matches = content.match(/^#{2,3}\s+.+$/gm);
    if (!matches) return;

    const seen = new Map<string, number>();
    const items: TOCItem[] = matches.map((match) => {
      const level = match.startsWith("### ") ? 3 : 2;
      const text = match.replace(/^#{2,3}\s+/, "");
      let id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      const count = seen.get(id) ?? 0;
      seen.set(id, count + 1);
      if (count > 0) id = `${id}-${count}`;
      return { id, text, level };
    });

    setHeadings(items);
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  return { headings, activeId };
}
