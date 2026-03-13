"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { readingTime, slugify } from "@/lib/utils";
import MarkdownEditor from "@/components/admin/MarkdownEditor";
import MetaPanel from "@/components/admin/MetaPanel";
import { Save, Send, ChevronLeft, Settings, Loader2 } from "lucide-react";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [seriesId, setSeriesId] = useState("");
  const [seriesOrder, setSeriesOrder] = useState(1);
  const [tags, setTags] = useState<string[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMeta, setShowMeta] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      const { data: post } = await supabase
        .from("posts")
        .select("*, post_tags(tag:tags(*))")
        .eq("id", postId)
        .single();

      if (post) {
        setTitle(post.title);
        setContent(post.content || "");
        setSlug(post.slug);
        setCategoryId(post.category_id || "");
        setSeriesId(post.series_id || "");
        setSeriesOrder(post.series_order || 1);
        setThumbnailUrl(post.thumbnail_url || "");
        setStatus(post.status);

        const postTags = (post.post_tags || [])
          .map((pt: { tag: { name: string } | null }) => pt.tag?.name)
          .filter(Boolean) as string[];
        setTags(postTags);
      }

      setLoading(false);
    };

    loadPost();
  }, [postId, supabase]);

  const savePost = async (newStatus: "draft" | "published") => {
    if (!title.trim()) return;
    setSaving(true);

    const postData: Record<string, unknown> = {
      title,
      slug,
      content,
      excerpt: content.substring(0, 200).replace(/[#*`>\-\[\]()!|]/g, "").trim(),
      thumbnail_url: thumbnailUrl || null,
      category_id: categoryId || null,
      series_id: seriesId || null,
      series_order: seriesId ? seriesOrder : null,
      status: newStatus,
      reading_time: readingTime(content),
      updated_at: new Date().toISOString(),
    };

    if (newStatus === "published" && status !== "published") {
      postData.published_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("posts")
      .update(postData)
      .eq("id", postId);

    if (!error) {
      // Update tags
      await supabase.from("post_tags").delete().eq("post_id", postId);

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
            .insert({ post_id: postId, tag_id: tag.id });
        }
      }

      router.push("/admin");
      router.refresh();
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ background: "var(--color-bg-primary)" }}
      >
        <Loader2 size={24} className="animate-spin" color="#3b82f6" />
      </div>
    );
  }

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
            <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>/ 글 수정</span>
          </div>
          <span
            className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded"
            style={{
              background:
                status === "published"
                  ? "rgba(34,197,94,0.1)"
                  : "rgba(245,158,11,0.1)",
              border:
                status === "published"
                  ? "1px solid rgba(34,197,94,0.2)"
                  : "1px solid rgba(245,158,11,0.2)",
              color: status === "published" ? "#22c55e" : "#f59e0b",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: status === "published" ? "#22c55e" : "#f59e0b",
              }}
            />
            {status === "published" ? "발행됨" : "임시저장"}
          </span>
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
            저장
          </button>
          <button
            onClick={() =>
              savePost(status === "published" ? "published" : "published")
            }
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[10px] font-bold transition-colors"
            style={{
              background: "#3b82f6",
              color: "#fff",
            }}
          >
            <Send size={12} />
            {status === "published" ? "업데이트" : "발행"}
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <MarkdownEditor
            title={title}
            content={content}
            onTitleChange={setTitle}
            onContentChange={setContent}
          />
        </div>

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
