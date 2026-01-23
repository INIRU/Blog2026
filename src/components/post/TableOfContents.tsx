'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown, HiListBullet } from 'react-icons/hi2';
import Slugger from 'github-slugger';
import styles from '@/styles/components/post/TableOfContents.module.css';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const slugger = new Slugger();
    
    const updateHeadings = () => {
      const container = document.getElementById('markdown-content');
      if (!container) return;

      const elements = container.querySelectorAll('h1, h2, h3');
      slugger.reset();

      const items: TocItem[] = Array.from(elements)
        .map((element) => {
          const id = element.id || '';
          
          const clone = element.cloneNode(true) as HTMLElement;
          const anchors = clone.querySelectorAll('a[href^="#"]');
          anchors.forEach(anchor => anchor.remove());
          const text = clone.textContent?.replace(/^#\s*/, '').trim() || '';
          
          if (!element.id && text) {
            element.id = slugger.slug(text);
          }
          
          return {
            id: element.id,
            text,
            level: Number(element.tagName.substring(1)),
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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -66%' }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (!id) return;
    
    setIsOpen(false);
    
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; 
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      
      window.scrollTo({ top: y, behavior: 'smooth' });
      
      window.history.pushState(null, '', `#${id}`);
      setActiveId(id);
    }
  };

  if (headings.length === 0) return null;

  const activeHeading = headings.find((h) => h.id === activeId);

  return (
    <>
      <nav className={styles.toc}>
        <h4 className={styles.title}>목차</h4>
        <ul className={styles.list}>
          {headings.map((heading, index) => (
            <li
              key={`${heading.id}-${index}`}
              className={`${styles.item} ${
                heading.level === 3 ? styles.nested : ''
              } ${activeId === heading.id ? styles.active : ''}`}
            >
              <a 
                href={`#${heading.id}`} 
                className={styles.link}
                onClick={(e) => handleLinkClick(e, heading.id)}
              >
                {activeId === heading.id && (
                  <motion.span
                    layoutId="activeIndicator"
                    className={styles.activeIndicator}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className={styles.text}>{heading.text}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.mobileToc}>
        <button
          className={styles.mobileToggle}
          onClick={() => setIsOpen(!isOpen)}
        >
          <HiListBullet className={styles.mobileIcon} />
          <span className={styles.mobileTitle}>
            {activeHeading?.text || '목차'}
          </span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <HiChevronDown className={styles.mobileChevron} />
          </motion.span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className={styles.mobileDropdown}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ul className={styles.mobileList}>
                {headings.map((heading, index) => (
                  <li
                    key={`${heading.id}-${index}`}
                    className={`${styles.mobileItem} ${
                      heading.level === 3 ? styles.nested : ''
                    } ${activeId === heading.id ? styles.active : ''}`}
                  >
                    <a
                      href={`#${heading.id}`}
                      className={styles.mobileLink}
                      onClick={(e) => handleLinkClick(e, heading.id)}
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
