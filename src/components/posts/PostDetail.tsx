"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import { useTheme } from "@/lib/theme";
import { CodeBlock } from "./CodeBlock";
import type { Components } from "react-markdown";

interface PostDetailProps {
  content: string;
}

function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function extractText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (!children) return "";
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (typeof children === "object" && "props" in children) {
    const el = children as React.ReactElement<{ children?: React.ReactNode }>;
    return extractText(el.props.children);
  }
  return "";
}

export function PostDetail({ content }: PostDetailProps) {
  const { isDark } = useTheme();

  const components: Components = {
    h2: ({ children, ...props }) => {
      const text = extractText(children);
      const id = generateId(text);
      return (
        <h2
          id={id}
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--color-text-primary)",
            marginTop: 48,
            marginBottom: 16,
            lineHeight: 1.35,
            paddingLeft: 16,
            borderLeft: "3px solid #3b82f6",
          }}
          {...props}
        >
          {children}
        </h2>
      );
    },

    h3: ({ children, ...props }) => {
      const text = extractText(children);
      const id = generateId(text);
      return (
        <h3
          id={id}
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "var(--color-text-primary)",
            marginTop: 24,
            marginBottom: 8,
            lineHeight: 1.4,
          }}
          {...props}
        >
          {children}
        </h3>
      );
    },

    p: ({ children, ...props }) => (
      <p
        style={{
          fontSize: 15,
          color: "var(--color-text-secondary)",
          lineHeight: 1.9,
          marginBottom: 16,
          marginTop: 0,
        }}
        {...props}
      >
        {children}
      </p>
    ),

    strong: ({ children, ...props }) => (
      <strong
        style={{
          color: isDark ? "#e2e8f0" : "#1e293b",
          fontWeight: 600,
        }}
        {...props}
      >
        {children}
      </strong>
    ),

    a: ({ children, href, ...props }) => (
      <a
        href={href}
        style={{
          color: "#3b82f6",
          textDecoration: "underline",
          textUnderlineOffset: 3,
        }}
        {...props}
      >
        {children}
      </a>
    ),

    blockquote: ({ children, ...props }) => (
      <blockquote
        style={{
          position: "relative",
          margin: "28px 0",
          padding: "20px 24px 20px 48px",
          background: "transparent",
          border: "none",
          color: "var(--color-text-secondary)",
          fontSize: 15,
          lineHeight: 1.85,
        }}
        {...props}
      >
        <span
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            fontSize: 40,
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
            top: 12,
            bottom: 12,
            width: 2,
            borderRadius: 2,
            background: "linear-gradient(180deg, #3b82f6 0%, rgba(59,130,246,0.1) 100%)",
          }}
        />
        {children}
      </blockquote>
    ),

    ul: ({ children, ...props }) => (
      <ul
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          listStyle: "none",
          padding: 0,
          margin: "8px 0 16px 0",
        }}
        {...props}
      >
        {children}
      </ul>
    ),

    li: ({ children, ...props }) => (
      <li
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          fontSize: 15,
          color: "var(--color-text-secondary)",
          lineHeight: 1.8,
        }}
        {...props}
      >
        <span
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: "#3b82f6",
            flexShrink: 0,
            marginTop: 10,
          }}
        />
        <span style={{ flex: 1 }}>{children}</span>
      </li>
    ),

    table: ({ children, ...props }) => (
      <div
        className="prose-table-wrapper"
        style={{
          overflowX: "auto",
          margin: "24px 0",
          borderRadius: 12,
          border: "1px solid rgba(59,130,246,0.12)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 13,
          }}
          {...props}
        >
          {children}
        </table>
      </div>
    ),

    thead: ({ children, ...props }) => (
      <thead
        style={{
          background: "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.05) 100%)",
        }}
        {...props}
      >
        {children}
      </thead>
    ),

    th: ({ children, ...props }) => (
      <th
        style={{
          padding: "12px 16px",
          textAlign: "left",
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: 0.5,
          textTransform: "uppercase" as const,
          color: "#60a5fa",
          borderBottom: "1px solid rgba(59,130,246,0.15)",
        }}
        {...props}
      >
        {children}
      </th>
    ),

    td: ({ children, ...props }) => (
      <td
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid var(--color-border)",
          color: "var(--color-text-secondary)",
        }}
        {...props}
      >
        {children}
      </td>
    ),

    hr: () => (
      <div
        style={{
          margin: "48px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, var(--color-border))" }} />
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#3b82f6", opacity: 0.4 }} />
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#3b82f6" }} />
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#3b82f6", opacity: 0.4 }} />
        </div>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, var(--color-border), transparent)" }} />
      </div>
    ),

    img: ({ src, alt }) => {
      if (!src || typeof src !== "string") return null;
      return (
        <span
          style={{
            display: "block",
            position: "relative",
            width: "100%",
            margin: "24px 0",
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid var(--color-border)",
          }}
        >
          <Image
            src={src}
            alt={alt ?? ""}
            width={1200}
            height={675}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </span>
      );
    },

    pre: ({ children, ...props }) => (
      <CodeBlock {...props}>{children}</CodeBlock>
    ),
  };

  return (
    <div>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
