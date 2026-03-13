"use client";

import { useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import EditorToolbar from "./EditorToolbar";
import { CodeBlock } from "@/components/posts/CodeBlock";
import { useTheme } from "@/lib/theme";

interface Props {
  title: string;
  content: string;
  onTitleChange: (v: string) => void;
  onContentChange: (v: string) => void;
}

export default function MarkdownEditor({
  title,
  content,
  onTitleChange,
  onContentChange,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isDark } = useTheme();

  const handleInsert = useCallback(
    (before: string, after: string = "") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = content.substring(start, end);
      const newText =
        content.substring(0, start) +
        before +
        selected +
        after +
        content.substring(end);

      onContentChange(newText);

      setTimeout(() => {
        textarea.focus();
        const cursorPos = start + before.length + selected.length;
        textarea.setSelectionRange(cursorPos, cursorPos);
      }, 0);
    },
    [content, onContentChange]
  );

  return (
    <div
      className="flex-1 grid grid-cols-2 min-h-0"
      style={{ borderTop: "1px solid var(--color-border)" }}
    >
      {/* Editor Pane */}
      <div
        className="flex flex-col min-h-0"
        style={{ borderRight: "1px solid var(--color-border)" }}
      >
        <div className="px-5 py-3">
          <span className="text-[9px] font-semibold tracking-[3px] uppercase" style={{ color: "var(--color-text-muted)" }}>
            마크다운
          </span>
        </div>
        <EditorToolbar onInsert={handleInsert} />
        <div className="px-5 py-3">
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="글 제목..."
            className="w-full text-xl font-extrabold bg-transparent outline-none mb-4"
            style={{
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
            }}
          />
        </div>
        <div className="flex-1 overflow-auto px-5 pb-5">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="마크다운으로 글을 작성하세요..."
            className="w-full h-full min-h-[500px] bg-transparent outline-none resize-none"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "13px",
              lineHeight: "1.8",
              color: "var(--color-text-secondary)",
            }}
          />
        </div>
      </div>

      {/* Preview Pane */}
      <div className="flex flex-col min-h-0" style={{ background: "var(--color-surface)" }}>
        <div className="px-5 py-3">
          <span className="text-[9px] font-semibold tracking-[3px] uppercase" style={{ color: "var(--color-text-muted)" }}>
            미리보기
          </span>
        </div>
        <div className="flex-1 overflow-auto px-6 py-4">
          {title && (
            <h1
              className="text-2xl font-extrabold mb-6"
              style={{
                backgroundImage: isDark
                  ? "linear-gradient(180deg, #f1f5f9 40%, #64748b 100%)"
                  : "linear-gradient(180deg, #0f172a 40%, #475569 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {title}
            </h1>
          )}
          <div className="prose-custom">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => (
                  <h2
                    className="text-[20px] font-bold mt-8 mb-3"
                    style={{
                      backgroundImage: isDark
                        ? "linear-gradient(180deg, #f1f5f9 40%, #94a3b8 100%)"
                        : "linear-gradient(180deg, #0f172a 40%, #475569 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-[16px] font-bold mt-6 mb-2 text-[var(--color-text-primary)]">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p
                    className="text-[15px] mb-4"
                    style={{
                      color: "var(--color-text-secondary)",
                      lineHeight: "1.9",
                    }}
                  >
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong
                    className="font-semibold"
                    style={{
                      color: isDark ? "#e2e8f0" : "#1e293b",
                    }}
                  >
                    {children}
                  </strong>
                ),
                a: ({ children, href }) => (
                  <a
                    href={href}
                    className="underline underline-offset-3"
                    style={{ color: "#3b82f6" }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                blockquote: ({ children }) => (
                  <blockquote
                    className="my-6"
                    style={{
                      position: "relative",
                      padding: "16px 20px 16px 40px",
                      background: "transparent",
                      border: "none",
                      color: "var(--color-text-secondary)",
                      fontSize: 14,
                      lineHeight: 1.85,
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: 6,
                        left: 6,
                        fontSize: 32,
                        fontFamily: "Georgia, serif",
                        fontWeight: 700,
                        lineHeight: 1,
                        color: "rgba(59,130,246,0.2)",
                        userSelect: "none",
                        pointerEvents: "none",
                      }}
                      aria-hidden="true"
                    >
                      &ldquo;
                    </span>
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 10,
                        bottom: 10,
                        width: 2,
                        borderRadius: 2,
                        background: "linear-gradient(180deg, #3b82f6 0%, rgba(59,130,246,0.1) 100%)",
                      }}
                    />
                    {children}
                  </blockquote>
                ),
                ul: ({ children }) => (
                  <ul className="flex flex-col gap-2 my-4 pl-4">{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="flex items-start gap-2 text-[15px]" style={{ color: "var(--color-text-secondary)", lineHeight: "1.9" }}>
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-[10px] flex-shrink-0"
                      style={{ background: "#3b82f6" }}
                    />
                    <span>{children}</span>
                  </li>
                ),
                pre: ({ children, ...props }) => (
                  <CodeBlock {...props}>{children}</CodeBlock>
                ),
                code: ({ children, className }) => {
                  if (className) {
                    return <code className={className} style={{ color: "#e2e8f0" }}>{children}</code>;
                  }
                  return <code>{children}</code>;
                },
                hr: () => (
                  <hr
                    className="my-8"
                    style={{
                      height: "1px",
                      background: "var(--color-border)",
                      border: "none",
                    }}
                  />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
