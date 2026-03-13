"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { readingTime, slugify } from "@/lib/utils";
import MarkdownEditor from "@/components/admin/MarkdownEditor";
import MetaPanel from "@/components/admin/MetaPanel";
import { Save, Send, ChevronLeft, Settings } from "lucide-react";

export default function NewPostPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [seriesId, setSeriesId] = useState("");
  const [seriesOrder, setSeriesOrder] = useState(1);
  const [tags, setTags] = useState<string[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [showMeta, setShowMeta] = useState(false);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!slug || slug === slugify(title)) {
      setSlug(slugify(v));
    }
  };

  const savePost = async (status: "draft" | "published") => {
    if (!title.trim()) return;
    setSaving(true);

    const postData = {
      title,
      slug: slug || slugify(title),
      content,
      excerpt: content.substring(0, 200).replace(/[#*`>\-\[\]()!|]/g, "").trim(),
      thumbnail_url: thumbnailUrl || null,
      category_id: categoryId || null,
      series_id: seriesId || null,
      series_order: seriesId ? seriesOrder : null,
      status,
      reading_time: readingTime(content),
      published_at: status === "published" ? new Date().toISOString() : null,
    };

    const { error } = await supabase.from("posts").insert(postData);

    if (!error) {
      // Handle tags
      if (tags.length > 0) {
        const { data: post } = await supabase
          .from("posts")
          .select("id")
          .eq("slug", postData.slug)
          .single();

        if (post) {
          for (const tagName of tags) {
            let { data: tag } = await supabase
              .from("tags")
              .select("id")
              .eq("name", tagName)
              .single();

            if (!tag) {
              const { data: newTag } = await supabase
                .from("tags")
                .insert({ name: tagName, slug: slugify(tagName) })
                .select("id")
                .single();
              tag = newTag;
            }

            if (tag) {
              await supabase
                .from("post_tags")
                .insert({ post_id: post.id, tag_id: tag.id });
            }
          }
        }
      }

      router.push("/admin");
      router.refresh();
    }

    setSaving(false);
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: "var(--color-bg-primary)" }}>
      {/* Top Bar */}
      <div
        className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin")}
            className="p-1.5 rounded-lg transition-colors"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-secondary)",
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold tracking-wide" style={{ color: "var(--color-text-primary)" }}>
              INIRU BLOG
            </span>
            <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>/ 새 글</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMeta(!showMeta)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors"
            style={{
              background: showMeta
                ? "rgba(59,130,246,0.12)"
                : "var(--color-surface)",
              border: showMeta
                ? "1px solid rgba(59,130,246,0.2)"
                : "1px solid var(--color-border-hover)",
              color: showMeta ? "#60a5fa" : "var(--color-text-secondary)",
            }}
          >
            <Settings size={12} />
            메타
          </button>
          <button
            onClick={() => savePost("draft")}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border-hover)",
              color: "var(--color-text-secondary)",
            }}
          >
            <Save size={12} />
            임시저장
          </button>
          <button
            onClick={() => savePost("published")}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[10px] font-bold transition-colors"
            style={{
              background: "#3b82f6",
              color: "#fff",
            }}
          >
            <Send size={12} />
            발행
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <MarkdownEditor
            title={title}
            content={content}
            onTitleChange={handleTitleChange}
            onContentChange={setContent}
          />
        </div>

        {/* Side Meta Panel */}
        {showMeta && (
          <div
            className="w-[260px] flex-shrink-0 overflow-y-auto"
            style={{
              borderLeft: "1px solid var(--color-border)",
              background: "var(--color-surface)",
            }}
          >
            <MetaPanel
              title={title}
              slug={slug}
              categoryId={categoryId}
              seriesId={seriesId}
              seriesOrder={seriesOrder}
              tags={tags}
              thumbnailUrl={thumbnailUrl}
              onSlugChange={setSlug}
              onCategoryChange={setCategoryId}
              onSeriesChange={setSeriesId}
              onSeriesOrderChange={setSeriesOrder}
              onTagsChange={setTags}
              onThumbnailChange={setThumbnailUrl}
            />
          </div>
        )}
      </div>
    </div>
  );
}
