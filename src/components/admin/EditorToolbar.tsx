"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  Code,
  Link as LinkIcon,
  ImagePlus,
  List,
  Minus,
  Loader2,
} from "lucide-react";

interface Props {
  onInsert: (before: string, after?: string) => void;
}

const tools = [
  { icon: Bold, before: "**", after: "**", label: "굵게" },
  { icon: Italic, before: "*", after: "*", label: "기울임" },
  { icon: Heading2, before: "## ", after: "", label: "H2" },
  { icon: Heading3, before: "### ", after: "", label: "H3" },
  { divider: true },
  { icon: Quote, before: "> ", after: "", label: "인용" },
  { icon: Code, before: "```\n", after: "\n```", label: "코드" },
  { icon: List, before: "- ", after: "", label: "목록" },
  { icon: Minus, before: "\n---\n", after: "", label: "구분선" },
  { divider: true },
  { icon: LinkIcon, before: "[", after: "](url)", label: "링크" },
] as const;

export default function EditorToolbar({ onInsert }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `posts/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from("blog-images")
      .upload(path, file);

    if (!error) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("blog-images").getPublicUrl(path);
      onInsert(`![${file.name}](${publicUrl})`, "");
    }

    setUploading(false);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      className="flex items-center gap-0.5 px-3 py-2"
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      {tools.map((tool, i) => {
        if ("divider" in tool) {
          return (
            <div
              key={`d-${i}`}
              className="w-px h-4 mx-1"
              style={{ background: "var(--color-border-hover)" }}
            />
          );
        }
        const Icon = tool.icon;
        return (
          <button
            key={tool.label}
            onClick={() => onInsert(tool.before, tool.after || "")}
            className="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
            style={{ color: "var(--color-text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--color-text-primary)";
              e.currentTarget.style.background = "var(--color-border-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--color-text-muted)";
              e.currentTarget.style.background = "transparent";
            }}
            title={tool.label}
            type="button"
          >
            <Icon size={14} />
          </button>
        );
      })}

      {/* Image upload button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
        style={{ color: uploading ? "#3b82f6" : "var(--color-text-muted)" }}
        onMouseEnter={(e) => {
          if (!uploading) {
            e.currentTarget.style.color = "var(--color-text-primary)";
            e.currentTarget.style.background = "var(--color-border-hover)";
          }
        }}
        onMouseLeave={(e) => {
          if (!uploading) {
            e.currentTarget.style.color = "var(--color-text-muted)";
            e.currentTarget.style.background = "transparent";
          }
        }}
        title="이미지 업로드"
        type="button"
      >
        {uploading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <ImagePlus size={14} />
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}
