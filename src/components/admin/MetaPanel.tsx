"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { slugify } from "@/lib/utils";
import { X, Upload, Plus, Check } from "lucide-react";
import { Select } from "@/components/ui/Select";
import type { Category, Series } from "@/lib/types";

interface Props {
  title: string;
  slug: string;
  categoryId: string;
  seriesId: string;
  seriesOrder: number;
  tags: string[];
  thumbnailUrl: string;
  onSlugChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onSeriesChange: (v: string) => void;
  onSeriesOrderChange: (v: number) => void;
  onTagsChange: (v: string[]) => void;
  onThumbnailChange: (v: string) => void;
}

export default function MetaPanel({
  title,
  slug,
  categoryId,
  seriesId,
  seriesOrder,
  tags,
  thumbnailUrl,
  onSlugChange,
  onCategoryChange,
  onSeriesChange,
  onSeriesOrderChange,
  onTagsChange,
  onThumbnailChange,
}: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddSeries, setShowAddSeries] = useState(false);
  const [newSeriesName, setNewSeriesName] = useState("");
  const [newSeriesDesc, setNewSeriesDesc] = useState("");
  const supabase = createClient();

  const loadData = () => {
    supabase
      .from("categories")
      .select("*")
      .order("name")
      .then(({ data }) => setCategories(data || []));
    supabase
      .from("series")
      .select("*")
      .order("name")
      .then(({ data }) => setSeriesList(data || []));
  };

  useEffect(() => {
    loadData();
  }, [supabase]);

  useEffect(() => {
    if (title && !slug) {
      onSlugChange(slugify(title));
    }
  }, [title, slug, onSlugChange]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      onTagsChange([...tags, t]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag));
  };

  const addCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    const { data, error } = await supabase
      .from("categories")
      .insert({ name, slug: slugify(name) })
      .select("id")
      .single();
    if (!error && data) {
      loadData();
      onCategoryChange(data.id);
      setNewCategoryName("");
      setShowAddCategory(false);
    }
  };

  const addSeries = async () => {
    const name = newSeriesName.trim();
    if (!name) return;
    const { data, error } = await supabase
      .from("series")
      .insert({
        name,
        slug: slugify(name),
        description: newSeriesDesc.trim() || null,
      })
      .select("id")
      .single();
    if (!error && data) {
      loadData();
      onSeriesChange(data.id);
      setNewSeriesName("");
      setNewSeriesDesc("");
      setShowAddSeries(false);
    }
  };

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop();
    const path = `thumbnails/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("blog-images")
      .upload(path, file);

    if (!error) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("blog-images").getPublicUrl(path);
      onThumbnailChange(publicUrl);
    }
  };

  const inputStyle = {
    background: "var(--color-surface-hover)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text-primary)",
  };

  const categoryOptions = [
    { value: "", label: "카테고리 선택" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const seriesOptions = [
    { value: "", label: "없음" },
    ...seriesList.map((s) => ({ value: s.id, label: s.name })),
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Post Info */}
      <div
        className="rounded-[12px] p-4"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <h3 className="text-[9px] font-semibold tracking-[3px] uppercase text-[#3b82f6] mb-4">
          글 정보
        </h3>

        <div className="flex flex-col gap-3">
          {/* Category */}
          <div>
            <label className="text-[9px] font-semibold uppercase tracking-[1px] mb-1.5 block" style={{ color: "var(--color-text-muted)" }}>
              카테고리
            </label>
            <div className="flex gap-1.5">
              <div className="flex-1">
                <Select
                  value={categoryId}
                  onChange={onCategoryChange}
                  options={categoryOptions}
                  placeholder="카테고리 선택"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowAddCategory((v) => !v)}
                className="flex items-center justify-center rounded-[8px] transition-all"
                style={{
                  width: 30,
                  height: 30,
                  border: showAddCategory
                    ? "1px solid rgba(59,130,246,0.3)"
                    : "1px solid var(--color-border)",
                  background: showAddCategory
                    ? "rgba(59,130,246,0.12)"
                    : "var(--color-surface-hover)",
                  color: showAddCategory ? "#60a5fa" : "var(--color-text-muted)",
                }}
              >
                <Plus size={12} />
              </button>
            </div>
            {showAddCategory && (
              <div
                className="flex gap-1.5 mt-2"
                style={{ animation: "selectDropIn 0.15s ease-out" }}
              >
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCategory();
                    }
                  }}
                  placeholder="새 카테고리"
                  className="flex-1 px-2.5 py-1.5 rounded-[6px] text-[10px] outline-none"
                  style={inputStyle}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={addCategory}
                  className="flex items-center justify-center rounded-[6px]"
                  style={{
                    width: 28,
                    height: 28,
                    background: "rgba(59,130,246,0.15)",
                    border: "1px solid rgba(59,130,246,0.2)",
                    color: "#60a5fa",
                  }}
                >
                  <Check size={11} />
                </button>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="text-[9px] font-semibold uppercase tracking-[1px] mb-1.5 block" style={{ color: "var(--color-text-muted)" }}>
              태그
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded"
                  style={{
                    background: "rgba(59,130,246,0.1)",
                    border: "1px solid rgba(59,130,246,0.15)",
                    color: "#60a5fa",
                  }}
                >
                  {tag}
                  <button onClick={() => removeTag(tag)} type="button">
                    <X size={10} color="#94a3b8" />
                  </button>
                </span>
              ))}
            </div>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="태그 입력 후 Enter"
              className="w-full px-3 py-1.5 rounded-[6px] text-[10px] outline-none"
              style={inputStyle}
            />
          </div>

          {/* Slug */}
          <div>
            <label className="text-[9px] font-semibold uppercase tracking-[1px] mb-1.5 block" style={{ color: "var(--color-text-muted)" }}>
              슬러그
            </label>
            <input
              value={slug}
              onChange={(e) => onSlugChange(e.target.value)}
              className="w-full px-3 py-1.5 rounded-[6px] text-[10px] font-mono outline-none"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Series */}
      <div
        className="rounded-[12px] p-4"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <h3 className="text-[9px] font-semibold tracking-[3px] uppercase text-[#3b82f6] mb-4">
          시리즈
        </h3>
        <div className="flex gap-1.5">
          <div className="flex-1">
            <Select
              value={seriesId}
              onChange={onSeriesChange}
              options={seriesOptions}
              placeholder="없음"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowAddSeries((v) => !v)}
            className="flex items-center justify-center rounded-[8px] transition-all"
            style={{
              width: 30,
              height: 30,
              border: showAddSeries
                ? "1px solid rgba(59,130,246,0.3)"
                : "1px solid var(--color-border)",
              background: showAddSeries
                ? "rgba(59,130,246,0.12)"
                : "var(--color-surface-hover)",
              color: showAddSeries ? "#60a5fa" : "var(--color-text-muted)",
            }}
          >
            <Plus size={12} />
          </button>
        </div>
        {showAddSeries && (
          <div
            className="flex flex-col gap-1.5 mt-2"
            style={{ animation: "selectDropIn 0.15s ease-out" }}
          >
            <input
              value={newSeriesName}
              onChange={(e) => setNewSeriesName(e.target.value)}
              placeholder="시리즈 이름"
              className="w-full px-2.5 py-1.5 rounded-[6px] text-[10px] outline-none"
              style={inputStyle}
              autoFocus
            />
            <div className="flex gap-1.5">
              <input
                value={newSeriesDesc}
                onChange={(e) => setNewSeriesDesc(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSeries();
                  }
                }}
                placeholder="설명 (선택)"
                className="flex-1 px-2.5 py-1.5 rounded-[6px] text-[10px] outline-none"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={addSeries}
                className="flex items-center justify-center rounded-[6px]"
                style={{
                  width: 28,
                  height: 28,
                  background: "rgba(59,130,246,0.15)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  color: "#60a5fa",
                }}
              >
                <Check size={11} />
              </button>
            </div>
          </div>
        )}
        {seriesId && (
          <div className="mt-3">
            <label className="text-[9px] font-semibold uppercase tracking-[1px] mb-1.5 block" style={{ color: "var(--color-text-muted)" }}>
              순서
            </label>
            <input
              type="number"
              value={seriesOrder}
              onChange={(e) => onSeriesOrderChange(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-[6px] text-[10px] outline-none"
              style={inputStyle}
              min={1}
            />
          </div>
        )}
      </div>

      {/* Thumbnail */}
      <div
        className="rounded-[12px] p-4"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <h3 className="text-[9px] font-semibold tracking-[3px] uppercase text-[#3b82f6] mb-4">
          썸네일
        </h3>
        {thumbnailUrl ? (
          <div className="relative rounded-[8px] overflow-hidden mb-2">
            <img
              src={thumbnailUrl}
              alt="thumbnail"
              className="w-full h-24 object-cover"
            />
            <button
              onClick={() => onThumbnailChange("")}
              className="absolute top-1 right-1 p-1 rounded-full"
              style={{ background: "rgba(0,0,0,0.6)" }}
              type="button"
            >
              <X size={12} color="#fff" />
            </button>
          </div>
        ) : (
          <label
            className="flex flex-col items-center justify-center py-6 rounded-[8px] cursor-pointer transition-colors"
            style={{
              background: "var(--color-surface)",
              border: "1px dashed var(--color-border-hover)",
            }}
          >
            <Upload size={18} style={{ color: "var(--color-text-muted)" }} />
            <span className="text-[9px] mt-1" style={{ color: "var(--color-text-muted)" }}>
              클릭하여 업로드
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
}
