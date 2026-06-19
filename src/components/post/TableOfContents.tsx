'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { HiChevronDown, HiListBullet } from 'react-icons/hi2';
import Slugger from 'github-slugger';
import styles from '@/styles/components/post/TableOfContents.module.css';
import { useToggle } from '@/hooks/useToggle';

interface TocItem {
  id: string;
  text: string;
  level: number;
  parentId?: string;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const activeIdRef = useRef('');
  const { value: isOpen, toggle, setOff } = useToggle(false);
  const mobileListId = useId();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const slugger = new Slugger();
    
    const updateHeadings = () => {
      const container = document.getElementById('markdown-content');
      if (!container) return;

      const elements = container.querySelectorAll('h1, h2, h3');
      slugger.reset();

      let lastH2Id = '';

      const items: TocItem[] = Array.from(elements)
        .map((element) => {
          const clone = element.cloneNode(true) as HTMLElement;
          const anchors = clone.querySelectorAll('a[href^="#"]');
          anchors.forEach(anchor => anchor.remove());
          const text = clone.textContent?.replace(/^#\s*/, '').trim() || '';
          
          if (!element.id && text) {
            element.id = slugger.slug(text);
          }
          
          const level = Number(element.tagName.substring(1));
          
          if (level === 2) {
            lastH2Id = element.id;
          }

          return {
            id: element.id,
            text,
            level,
            parentId: level === 3 ? lastH2Id : undefined,
          };
        })
        .filter((item) => item.text.trim() !== '' && item.id);

      setHeadings(items);
    };

    const timeoutId = requestAnimationFrame(() => {
      updateHeadings();
    });
    
    const observer = new MutationObserver(() => {
      requestAnimationFrame(updateHeadings);
    });
    
    const container = document.getElementById('markdown-content');
    if (container) {
      observer.observe(container, { childList: true, subtree: true });
    }

    return () => {
      observer.disconnect();
      cancelAnimationFrame(timeoutId);
    };
  }, [content]);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    if (headings.length === 0) return;

    const headingElements = headings
      .map(({ id }) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (headingElements.length === 0) return;

    let frameId = 0;

    const updateActiveHeading = () => {
      const activationLine = window.scrollY + 128;
      let nextActiveId = headingElements[0].id;

      for (const element of headingElements) {
        if (element.offsetTop <= activationLine) {
          nextActiveId = element.id;
        } else {
          break;
        }
      }

      if (activeIdRef.current !== nextActiveId) {
        activeIdRef.current = nextActiveId;
        setActiveId(nextActiveId);
      }
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateActiveHeading);
    };

    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [headings]);

  const handleLinkClick = (id: string) => {
    if (!id) return;

    setOff();
    setActiveId(id);
  };

  if (headings.length === 0) return null;

  const activeHeading = headings.find((h) => h.id === activeId);
  const activeIndex = headings.findIndex((h) => h.id === activeId);
  const activeParentId = activeHeading?.level === 3 
    ? activeHeading.parentId 
    : (activeHeading?.level === 2 ? activeHeading.id : undefined);

  const isHeadingVisible = (heading: TocItem, index: number) => {
    if (heading.level !== 3) return true;
    if (heading.parentId === activeParentId) return true;
    if (activeIndex === -1) return false;

    return Math.abs(index - activeIndex) <= 1;
  };

  return (
    <>
      <nav className={styles.toc} aria-label="글 목차">
        <h4 className={styles.title}>목차</h4>
        <ul className={styles.list}>
          {headings.map((heading, index) => {
            const isVisible = isHeadingVisible(heading, index);

            if (!isVisible) return null;

            return (
              <li
                key={`${heading.id}-${index}`}
                className={`${styles.item} ${
                  heading.level === 3 ? styles.nested : ''
                } ${activeId === heading.id ? styles.active : ''}`}
              >
                <a
                  href={`#${heading.id}`}
                  className={styles.link}
                  onClick={() => handleLinkClick(heading.id)}
                >
                  <span className={styles.text}>{heading.text}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.mobileToc}>
        <button
          type="button"
          className={styles.mobileToggle}
          onClick={toggle}
          aria-expanded={isOpen}
          aria-controls={mobileListId}
        >
          <HiListBullet className={styles.mobileIcon} aria-hidden="true" />
          <span className={styles.mobileTitle}>
            {activeHeading?.text || '목차'}
          </span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          >
            <HiChevronDown className={styles.mobileChevron} aria-hidden="true" />
          </motion.span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className={styles.mobileDropdown}
              id={mobileListId}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              onClick={setOff}
            >
              <ul className={styles.mobileList}>
                {headings.map((heading, index) => {
                  const isVisible = isHeadingVisible(heading, index);

                  if (!isVisible) return null;

                  return (
                    <li
                      key={`${heading.id}-${index}`}
                      className={`${styles.mobileItem} ${
                        heading.level === 3 ? styles.nested : ''
                      } ${activeId === heading.id ? styles.active : ''}`}
                    >
                      <a
                        href={`#${heading.id}`}
                        className={styles.mobileLink}
                        onClick={() => handleLinkClick(heading.id)}
                      >
                        {heading.text}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
