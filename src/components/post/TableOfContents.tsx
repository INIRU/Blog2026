'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown, HiListBullet } from 'react-icons/hi2';
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
    const regex = /^(#{2,3})\s+(.+)$/gm;
    const items: TocItem[] = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2];
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s]/g, '')
        .replace(/\s+/g, '-');
      items.push({ id, text, level });
    }

    setHeadings(items);
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

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  if (headings.length === 0) return null;

  const activeHeading = headings.find((h) => h.id === activeId);

  return (
    <>
      <nav className={styles.toc}>
        <h4 className={styles.title}>목차</h4>
        <ul className={styles.list}>
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={`${styles.item} ${
                heading.level === 3 ? styles.nested : ''
              } ${activeId === heading.id ? styles.active : ''}`}
            >
              <a href={`#${heading.id}`} className={styles.link}>
                {heading.text}
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
                {headings.map((heading) => (
                  <li
                    key={heading.id}
                    className={`${styles.mobileItem} ${
                      heading.level === 3 ? styles.nested : ''
                    } ${activeId === heading.id ? styles.active : ''}`}
                  >
                    <a
                      href={`#${heading.id}`}
                      className={styles.mobileLink}
                      onClick={handleLinkClick}
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
