'use client';

import { ReactNode, useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { HiClipboard, HiCheck } from 'react-icons/hi';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import {
  GistEmbed,
  CodeSandboxEmbed,
  StackBlitzEmbed,
  CodePenEmbed,
  parseEmbedUrl,
} from '@/components/markdown/CodeEmbed';
import { CodeRunner } from '@/components/markdown/CodeRunner';
import { LanguageIcon } from '@/components/markdown/LanguageIcon';
import styles from '@/styles/components/markdown/MarkdownRenderer.module.css';

const RUNNABLE_LANGUAGES = ['javascript', 'js', 'typescript', 'ts'];

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: ReactNode;
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className={styles.copyButton} title="Copy code">
      {copied ? <HiCheck /> : <HiClipboard />}
    </button>
  );
}

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : false;

  const images = useMemo(() => {
    const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const matches: { src: string; alt: string }[] = [];
    let match;
    while ((match = imgRegex.exec(content)) !== null) {
      matches.push({ alt: match[1], src: match[2] });
    }
    return matches;
  }, [content]);

  const openLightbox = (src: string) => {
    const index = images.findIndex((img) => img.src === src);
    if (index !== -1) {
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  };

  return (
    <div className={styles.markdown}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ inline, className, children, ...props }: CodeBlockProps) {
            const codeString = String(children).replace(/\n$/, '');
            
            if (inline || !className?.includes('language-')) {
              return (
                <code className={styles.inlineCode} {...props}>
                  {children}
                </code>
              );
            }

            const match = /language-(\w+)(?::(.+))?/.exec(className || '');
            const language = match ? match[1] : 'text';
            const filename = match?.[2] || null;

            if (RUNNABLE_LANGUAGES.includes(language.toLowerCase())) {
              return <CodeRunner code={codeString} language={language} filename={filename} />;
            }

            return (
              <div className={styles.codeBlock}>
                <div className={styles.codeHeader}>
                  <div className={styles.codeHeaderLeft}>
                    <LanguageIcon language={language} size={16} />
                    {filename ? (
                      <span className={styles.filename}>{filename}</span>
                    ) : (
                      <span className={styles.language}>{language}</span>
                    )}
                  </div>
                  <CopyButton code={codeString} />
                </div>
                <SyntaxHighlighter
                  style={isDark ? oneDark : oneLight}
                  language={language}
                  PreTag="div"
                  showLineNumbers
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    borderRadius: '0 0 8px 8px',
                    fontSize: '0.875rem',
                    lineHeight: '1.7',
                  }}
                  lineNumberStyle={{
                    minWidth: '2rem',
                    paddingRight: '1rem',
                    opacity: 0.5,
                    userSelect: 'none',
                  }}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            );
          },

          h1: ({ children }) => <h1 className={styles.h1}>{children}</h1>,
          h2: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
          h3: ({ children }) => <h3 className={styles.h3}>{children}</h3>,
          h4: ({ children }) => <h4 className={styles.h4}>{children}</h4>,
          
          p: ({ children }) => <p className={styles.p}>{children}</p>,
          
          blockquote: ({ children }) => (
            <blockquote className={styles.blockquote}>{children}</blockquote>
          ),

          ul: ({ children }) => <ul className={styles.ul}>{children}</ul>,
          ol: ({ children }) => <ol className={styles.ol}>{children}</ol>,
          li: ({ children }) => <li className={styles.li}>{children}</li>,

          a: ({ children, href }) => {
            if (href) {
              const embed = parseEmbedUrl(href);
              if (embed) {
                switch (embed.type) {
                  case 'gist':
                    return <GistEmbed username={embed.username} gistId={embed.id} file={embed.file} />;
                  case 'codesandbox':
                    return <CodeSandboxEmbed sandboxId={embed.id} />;
                  case 'stackblitz':
                    return <StackBlitzEmbed projectId={embed.id} />;
                  case 'codepen':
                    return <CodePenEmbed username={embed.username} penId={embed.id} />;
                }
              }
            }

            return (
              <a
                href={href}
                className={styles.link}
                target={href?.startsWith('http') ? '_blank' : undefined}
                rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {children}
              </a>
            );
          },

          img: ({ src, alt }) => {
            const imgSrc = typeof src === 'string' ? src : '';
            return (
              <span
                className={styles.imageWrapper}
                onClick={() => imgSrc && openLightbox(imgSrc)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && imgSrc && openLightbox(imgSrc)}
              >
                <Image
                  src={imgSrc}
                  alt={alt || ''}
                  width={800}
                  height={450}
                  className={styles.image}
                  unoptimized={imgSrc.includes('supabase')}
                />
              </span>
            );
          },

          hr: () => <hr className={styles.hr} />,

          table: ({ children }) => (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className={styles.thead}>{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className={styles.tr}>{children}</tr>,
          th: ({ children }) => <th className={styles.th}>{children}</th>,
          td: ({ children }) => <td className={styles.td}>{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>

      {images.length > 0 && (
        <ImageLightbox
          isOpen={lightboxOpen}
          src={images[lightboxIndex]?.src || ''}
          alt={images[lightboxIndex]?.alt || ''}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setLightboxIndex((prev) => prev - 1)}
          onNext={() => setLightboxIndex((prev) => prev + 1)}
          hasPrev={lightboxIndex > 0}
          hasNext={lightboxIndex < images.length - 1}
        />
      )}
    </div>
  );
}
