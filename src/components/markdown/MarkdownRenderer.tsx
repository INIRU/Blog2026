'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { useToast } from '@/components/ui/Toast';
import styles from '@/styles/components/markdown/MarkdownRenderer.module.css';
import { extractImagesFromMarkdown } from '@/lib/markdown';
import { CodeBlock } from './renderers/CodeBlock';
import { CustomImage } from './renderers/CustomImage';
import { CustomLink } from './renderers/CustomLink';
import { useMounted } from '@/hooks/useMounted';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const mounted = useMounted();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { showToast } = useToast();
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    hasScrolledRef.current = false;
  }, [content]);

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');

    if (anchor && anchor.classList.contains(styles.anchor)) {
      e.preventDefault();
      const rawId = anchor.hash.substring(1);
      const id = decodeURIComponent(rawId);
      const element = document.getElementById(id);

      if (element) {
        const url = `${window.location.origin}${window.location.pathname}#${id}`;
        navigator.clipboard.writeText(url).then(() => {
          showToast('링크가 복사되었습니다.', 'success');
        });

        const yOffset = -100; 
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        
        window.scrollTo({ top: y, behavior: 'smooth' });
        window.history.pushState(null, '', `#${id}`);
      }
    }
  };

  const scrollToHash = useCallback((hash: string) => {
    if (!hash) return;
    const rawId = hash.substring(1);
    const id = decodeURIComponent(rawId);
    let attempts = 0;
    const maxAttempts = 12;
    const settleThreshold = 4;

    const scrollToElement = (target: HTMLElement) => {
      const yOffset = -80;
      const y = target.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      hasScrolledRef.current = true;
      return y;
    };

    const tryScroll = () => {
      const element = document.getElementById(id);
      if (element) {
        const targetY = scrollToElement(element);
        if (attempts < maxAttempts) {
          attempts += 1;
          window.setTimeout(() => {
            const distance = Math.abs(window.scrollY - targetY);
            if (distance > settleThreshold) {
              tryScroll();
            }
          }, 120);
        }
        return;
      }

      if (attempts < maxAttempts) {
        attempts += 1;
        window.setTimeout(tryScroll, 100);
      }
    };

    tryScroll();
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (typeof window === 'undefined') return;

    scrollToHash(window.location.hash);
  }, [mounted, content, scrollToHash]);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    let attempts = 0;
    const interval = window.setInterval(() => {
      const hash = window.location.hash;
      if (hash) {
        scrollToHash(hash);
        window.clearInterval(interval);
        return;
      }

      attempts += 1;
      if (attempts >= 10) {
        window.clearInterval(interval);
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [mounted, content, scrollToHash]);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    const onHashChange = () => {
      scrollToHash(window.location.hash);
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [mounted, scrollToHash]);

  const images = useMemo(() => {
    return extractImagesFromMarkdown(content);
  }, [content]);

  const openLightbox = (src: string) => {
    const index = images.findIndex((img) => img.src === src);
    if (index !== -1) {
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.markdown} onClick={handleContentClick}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[
          rehypeRaw, 
          rehypeSlug, 
          [rehypeAutolinkHeadings, {
            behavior: 'prepend',
            properties: {
              className: [styles.anchor],
              ariaHidden: true,
              tabIndex: -1,
            },
            content: [
              {
                type: 'text',
                value: '#'
              }
            ],
          }]
        ]}
        components={{
          code: CodeBlock,
          pre: ({ children }) => <>{children}</>,
          
          h1: ({ children, id }) => <h1 id={id} className={styles.h1}>{children}</h1>,
          h2: ({ children, id }) => <h2 id={id} className={styles.h2}>{children}</h2>,
          h3: ({ children, id }) => <h3 id={id} className={styles.h3}>{children}</h3>,
          h4: ({ children, id }) => <h4 id={id} className={styles.h4}>{children}</h4>,
          
          p: ({ children }) => <p className={styles.p}>{children}</p>,
          
          blockquote: ({ children }) => (
            <blockquote className={styles.blockquote}>{children}</blockquote>
          ),

          ul: ({ children }) => <ul className={styles.ul}>{children}</ul>,
          ol: ({ children }) => <ol className={styles.ol}>{children}</ol>,
          li: ({ children }) => <li className={styles.li}>{children}</li>,

          a: CustomLink,

          img: (props) => <CustomImage {...props} onClick={openLightbox} />,

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
