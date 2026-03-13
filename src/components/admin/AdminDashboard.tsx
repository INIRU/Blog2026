"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import {
  Plus,
  Edit3,
  Trash2,
  LogOut,
  FileText,
  Eye,
  Clock,
  BarChart3,
  TrendingUp,
  Layers,
} from "lucide-react";
import Link from "next/link";
import type { Post, Category } from "@/lib/types";

interface Props {
  posts: (Post & { category: Category })[];
  userEmail: string;
}

export default function AdminDashboard({ posts, userEmail }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 포스트를 삭제하시겠습니까?`)) return;
    await supabase.from("posts").delete().eq("id", id);
    router.refresh();
  };

  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;
  const totalViews = posts.reduce((sum, p) => sum + (p.view_count || 0), 0);

  const stats = [
    {
      label: "전체 글",
      value: posts.length,
      icon: Layers,
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.08)",
      border: "rgba(59,130,246,0.15)",
    },
    {
      label: "발행됨",
      value: publishedCount,
      icon: TrendingUp,
      color: "#22c55e",
      bg: "rgba(34,197,94,0.08)",
      border: "rgba(34,197,94,0.15)",
    },
    {
      label: "임시저장",
      value: draftCount,
      icon: FileText,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.08)",
      border: "rgba(245,158,11,0.15)",
    },
    {
      label: "총 조회수",
      value: totalViews.toLocaleString(),
      icon: BarChart3,
      color: "#a78bfa",
      bg: "rgba(167,139,250,0.08)",
      border: "rgba(167,139,250,0.15)",
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg-primary)" }}>
      {/* Top Bar */}
      <div
        className="flex items-center justify-between px-8 py-4"
        style={{
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-[8px] flex items-center justify-center"
            style={{
              background: "rgba(59,130,246,0.12)",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            <span className="text-[10px] font-black" style={{ color: "var(--color-primary-light)" }}>B</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-[13px] font-bold tracking-wide" style={{ color: "var(--color-text-primary)" }}>
              INIRU BLOG
            </h1>
            <span
              className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
              style={{
                background: "rgba(59,130,246,0.1)",
                border: "1px solid rgba(59,130,246,0.15)",
                color: "var(--color-primary-light)",
              }}
            >
              ADMIN
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>{userEmail}</span>
          <div
            className="w-px h-4"
            style={{ background: "var(--color-border)" }}
          />
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[11px] font-medium transition-all"
            style={{
              color: "var(--color-text-muted)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ef4444";
              e.currentTarget.style.background = "rgba(239,68,68,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--color-text-muted)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LogOut size={12} />
            로그아웃
          </button>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[12px] p-4"
              style={{
                background: stat.bg,
                border: `1px solid ${stat.border}`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-[9px] font-semibold tracking-[1.5px] uppercase"
                  style={{ color: stat.color }}
                >
                  {stat.label}
                </span>
                <stat.icon size={14} style={{ color: stat.color, opacity: 0.6 }} />
              </div>
              <span
                className="text-2xl font-extrabold"
                style={{ color: stat.color }}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2
              className="text-xl font-extrabold"
              style={{
                backgroundImage: "var(--gradient-heading)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              모든 글
            </h2>
          </div>
          <Link
            href="/admin/posts/new"
            className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[12px] font-bold transition-all"
            style={{
              background: "#3b82f6",
              color: "#fff",
              boxShadow: "0 4px 16px rgba(59,130,246,0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#2563eb";
              e.currentTarget.style.boxShadow =
                "0 6px 24px rgba(59,130,246,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#3b82f6";
              e.currentTarget.style.boxShadow =
                "0 4px 16px rgba(59,130,246,0.25)";
            }}
          >
            <Plus size={14} />
            새 글 작성
          </Link>
        </div>

        {/* Post List */}
        {posts.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 rounded-[16px]"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              className="w-16 h-16 rounded-[16px] flex items-center justify-center mb-4"
              style={{
                background: "rgba(59,130,246,0.08)",
                border: "1px solid rgba(59,130,246,0.12)",
              }}
            >
              <FileText size={24} color="#3b82f6" />
            </div>
            <p className="text-[14px] font-semibold mb-1" style={{ color: "var(--color-text-secondary)" }}>
              아직 글이 없습니다
            </p>
            <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
              첫 번째 글을 작성해보세요
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {posts.map((post) => (
              <div
                key={post.id}
                className="group flex items-center gap-4 px-5 py-4 rounded-[12px] transition-all"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--color-surface-hover)";
                  e.currentTarget.style.borderColor = "var(--color-border-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--color-surface)";
                  e.currentTarget.style.borderColor = "var(--color-border)";
                }}
              >
                {/* Status dot */}
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    background:
                      post.status === "published" ? "#22c55e" : "#f59e0b",
                    boxShadow:
                      post.status === "published"
                        ? "0 0 8px rgba(34,197,94,0.4)"
                        : "0 0 8px rgba(245,158,11,0.3)",
                  }}
                />

                {/* Title + Meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="text-[13px] font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
                      {post.title}
                    </span>
                    {post.category && (
                      <span
                        className="flex-shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          background: "rgba(59,130,246,0.1)",
                          border: "1px solid rgba(59,130,246,0.12)",
                          color: "var(--color-primary-light)",
                        }}
                      >
                        {post.category.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                      <Clock size={10} />
                      {post.published_at
                        ? formatDate(post.published_at)
                        : formatDate(post.created_at)}
                    </span>
                    <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                      <Eye size={10} />
                      {post.view_count}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                      {post.reading_time}분
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] text-[10px] font-medium transition-all"
                    style={{
                      background: "var(--color-surface-hover)",
                      border: "1px solid var(--color-border-hover)",
                      color: "var(--color-text-secondary)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(59,130,246,0.3)";
                      e.currentTarget.style.color = "var(--color-primary-light)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--color-border-hover)";
                      e.currentTarget.style.color = "var(--color-text-secondary)";
                    }}
                  >
                    <Edit3 size={11} />
                    수정
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id, post.title)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] text-[10px] font-medium transition-all"
                    style={{
                      background: "transparent",
                      border: "1px solid transparent",
                      color: "var(--color-text-muted)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(239,68,68,0.06)";
                      e.currentTarget.style.borderColor =
                        "rgba(239,68,68,0.15)";
                      e.currentTarget.style.color = "#ef4444";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "transparent";
                      e.currentTarget.style.color = "var(--color-text-muted)";
                    }}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
