"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { codeToHtml } from "shiki";

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && "props" in node) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>;
    return extractText(el.props.children);
  }
  return "";
}

const DEVICON_MAP: Record<string, string> = {
  typescript: "typescript",
  tsx: "typescript",
  ts: "typescript",
  javascript: "javascript",
  jsx: "javascript",
  js: "javascript",
  css: "css3",
  html: "html5",
  bash: "bash",
  shell: "bash",
  sh: "bash",
  zsh: "bash",
  python: "python",
  py: "python",
  rust: "rust",
  go: "go",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  sql: "azuresqldatabase",
  graphql: "graphql",
  markdown: "markdown",
  md: "markdown",
  swift: "swift",
  kotlin: "kotlin",
  java: "java",
  c: "c",
  cpp: "cplusplus",
  ruby: "ruby",
  php: "php",
  docker: "docker",
  dockerfile: "docker",
  react: "react",
  vue: "vuejs",
  svelte: "svelte",
  dart: "dart",
  lua: "lua",
  scala: "scala",
  r: "r",
};

function getLangIcon(lang: string): string | null {
  const name = DEVICON_MAP[lang];
  if (!name) return null;
  return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${name}/${name}-original.svg`;
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);

  const language = useMemo(() => {
    if (className) {
      const match = className.match(/language-(\w+)/);
      if (match) return match[1];
    }
    if (
      children &&
      typeof children === "object" &&
      "props" in (children as any)
    ) {
      const childClass = (
        children as React.ReactElement<{ className?: string }>
      ).props?.className;
      if (childClass) {
        const match = childClass.match(/language-(\w+)/);
        if (match) return match[1];
      }
    }
    return "";
  }, [className, children]);

  const codeText = useMemo(
    () => extractText(children).replace(/\n$/, ""),
    [children]
  );

  useEffect(() => {
    if (!codeText || !language) return;

    let cancelled = false;

    codeToHtml(codeText, {
      lang: language,
      theme: "catppuccin-mocha",
    })
      .then((html) => {
        if (!cancelled) setHighlightedHtml(html);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [codeText, language]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(codeText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [codeText]);

  return (
    <div
      style={{
        background: "#0d1117",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 8,
        overflow: "hidden",
        fontFamily: "'JetBrains Mono', monospace",
        margin: "20px 0",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            fontSize: 12,
            fontWeight: 500,
            color: "#484f5e",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {getLangIcon(language) ? (
            <img
              src={getLangIcon(language)!}
              alt={language}
              width={14}
              height={14}
              style={{ flexShrink: 0 }}
            />
          ) : (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#7c8497",
                flexShrink: 0,
              }}
            />
          )}
          {language || "code"}
        </span>

        <button
          onClick={handleCopy}
          aria-label={copied ? "복사됨" : "코드 복사"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "2px 6px",
            border: "none",
            background: "transparent",
            color: copied ? "#22c55e" : "#484f5e",
            cursor: "pointer",
            borderRadius: 4,
            transition: "color 0.2s",
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "복사됨" : "복사"}
        </button>
      </div>

      {/* Code body */}
      {highlightedHtml ? (
        <div
          className="shiki-container"
          style={{
            padding: "14px 0",
            fontSize: 13,
            lineHeight: 1.75,
            overflowX: "auto",
            margin: 0,
          }}
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      ) : (
        <pre
          style={{
            padding: "14px 20px",
            fontSize: 13,
            lineHeight: 1.75,
            overflowX: "auto",
            margin: 0,
            color: "#c9d1d9",
          }}
        >
          <code>{codeText}</code>
        </pre>
      )}
    </div>
  );
}
