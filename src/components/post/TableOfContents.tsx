'use client';

import {
  type MouseEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { HiChevronDown, HiListBullet } from 'react-icons/hi2';
import Slugger from 'github-slugger';
import styles from '@/styles/components/post/TableOfContents.module.css';
import { useToggle } from '@/hooks/useToggle';

interface TocItem {
  id: string;
  text: string;
  level: 1 | 2 | 3;
}

interface TableOfContentsProps {
  content: string;
}

const CONTENT_ID = 'markdown-content';
const SCROLL_OFFSET = 112;
const ACTIVE_OFFSET_TOLERANCE = 8;
const PROGRAMMATIC_SCROLL_TIMEOUT = 1600;

const getHeadingText = (element: Element) => {
  const clone = element.cloneNode(true) as HTMLElement;
  const anchors = clone.querySelectorAll('a[href^="#"], .anchor');
  anchors.forEach((anchor) => anchor.remove());

  return clone.textContent?.replace(/^#\s*/, '').trim() || '';
};

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const getHeadingElements = (headings: TocItem[]) =>
  headings
    .map((heading) => document.getElementById(heading.id))
    .filter((element): element is HTMLElement => Boolean(element));

const getCurrentActiveId = (headings: TocItem[]) => {
  const headingElements = getHeadingElements(headings);
  if (headingElements.length === 0) return '';

  const isAtDocumentBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

  if (isAtDocumentBottom) {
    return headingElements[headingElements.length - 1].id;
  }

  let activeId = headingElements[0].id;
  headingElements.forEach((heading) => {
    if (heading.getBoundingClientRect().top <= SCROLL_OFFSET + ACTIVE_OFFSET_TOLERANCE) {
      activeId = heading.id;
    }
  });

  return activeId;
};

const areHeadingsEqual = (current: TocItem[], next: TocItem[]) =>
  current.length === next.length &&
  current.every(
    (item, index) =>
      item.id === next[index].id &&
      item.text === next[index].text &&
      item.level === next[index].level,
  );

const getHeadingHref = (id: string) => `#${encodeURIComponent(id)}`;

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState('');
  const activeIdRef = useRef(activeId);
  const frameRef = useRef<number | null>(null);
  const collectFrameRef = useRef<number | null>(null);
  const programmaticTargetIdRef = useRef<string | null>(null);
  const programmaticTargetTimeoutRef = useRef<number | null>(null);
  const { value: isOpen, toggle, setOff } = useToggle(false);
  const mobileListId = useId();
  const shouldReduceMotion = useReducedMotion();

  const updateActiveId = useCallback((nextActiveId: string) => {
    if (!nextActiveId || activeIdRef.current === nextActiveId) return;

    activeIdRef.current = nextActiveId;
    setActiveId(nextActiveId);
  }, []);

  const clearProgrammaticTarget = useCallback((targetId?: string) => {
    if (targetId && programmaticTargetIdRef.current !== targetId) return;

    programmaticTargetIdRef.current = null;
    if (programmaticTargetTimeoutRef.current !== null) {
      window.clearTimeout(programmaticTargetTimeoutRef.current);
      programmaticTargetTimeoutRef.current = null;
    }
  }, []);

  const scheduleActiveSync = useCallback(
    (forcedId?: string) => {
      if (frameRef.current !== null) return;

      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        const lockedTargetId = programmaticTargetIdRef.current;
        updateActiveId(lockedTargetId ?? forcedId ?? getCurrentActiveId(headings));
      });
    },
    [headings, updateActiveId],
  );

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    const collectHeadings = () => {
      const container = document.getElementById(CONTENT_ID);
      if (!container) return;

      const slugger = new Slugger();
      const elements = Array.from(container.querySelectorAll('h1, h2, h3'));
      const nextHeadings: TocItem[] = elements
        .map((element) => {
          const text = getHeadingText(element);
          if (!text) return null;

          if (!element.id) {
            element.id = slugger.slug(text);
          }

          const level = Number(element.tagName.substring(1)) as TocItem['level'];
          return { id: element.id, text, level };
        })
        .filter((heading): heading is TocItem => Boolean(heading?.id));

      setHeadings((currentHeadings) =>
        areHeadingsEqual(currentHeadings, nextHeadings) ? currentHeadings : nextHeadings,
      );
    };

    const scheduleCollectHeadings = () => {
      if (collectFrameRef.current !== null) {
        cancelAnimationFrame(collectFrameRef.current);
      }

      collectFrameRef.current = requestAnimationFrame(() => {
        collectFrameRef.current = null;
        collectHeadings();
      });
    };

    scheduleCollectHeadings();

    const container = document.getElementById(CONTENT_ID);
    const observer = new MutationObserver(scheduleCollectHeadings);

    if (container) {
      observer.observe(container, { childList: true, subtree: true });
    }

    return () => {
      observer.disconnect();
      if (collectFrameRef.current !== null) {
        cancelAnimationFrame(collectFrameRef.current);
      }
    };
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    scheduleActiveSync();

    const handleScroll = () => scheduleActiveSync();
    const handleResize = () => scheduleActiveSync();
    const handleScrollEnd = () => {
      if (!programmaticTargetIdRef.current) return;

      clearProgrammaticTarget();
      scheduleActiveSync();
    };
    const handleManualScrollIntent = () => {
      if (!programmaticTargetIdRef.current) return;

      clearProgrammaticTarget();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    window.addEventListener('scrollend', handleScrollEnd);
    window.addEventListener('wheel', handleManualScrollIntent, { passive: true });
    window.addEventListener('touchstart', handleManualScrollIntent, { passive: true });
    window.addEventListener('keydown', handleManualScrollIntent);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scrollend', handleScrollEnd);
      window.removeEventListener('wheel', handleManualScrollIntent);
      window.removeEventListener('touchstart', handleManualScrollIntent);
      window.removeEventListener('keydown', handleManualScrollIntent);
      clearProgrammaticTarget();
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [clearProgrammaticTarget, headings, scheduleActiveSync]);

  const scrollToHeading = useCallback(
    (id: string) => {
      const element = document.getElementById(id);
      if (!element) return;

      const nextHash = `#${encodeURIComponent(id)}`;
      const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;
      const top = element.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;

      window.history.pushState(null, '', nextUrl);
      programmaticTargetIdRef.current = id;
      if (programmaticTargetTimeoutRef.current !== null) {
        window.clearTimeout(programmaticTargetTimeoutRef.current);
      }
      programmaticTargetTimeoutRef.current = window.setTimeout(() => {
        clearProgrammaticTarget(id);
        scheduleActiveSync();
      }, PROGRAMMATIC_SCROLL_TIMEOUT);
      updateActiveId(id);
      window.scrollTo({
        top: Math.max(0, top),
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });

      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '-1');
      }
      element.focus({ preventScroll: true });
    },
    [clearProgrammaticTarget, scheduleActiveSync, updateActiveId],
  );

  const handleItemClick = (
    event: MouseEvent<HTMLAnchorElement>,
    id: string,
    closeMobile = false,
  ) => {
    event.preventDefault();
    if (closeMobile) setOff();
    scrollToHeading(id);
  };

  if (headings.length === 0) return null;

  const renderItems = () => (
    <ul className={styles.list}>
      {headings.map((heading) => {
        const isActive = activeId === heading.id;
        const levelClass =
          heading.level === 1
            ? styles.level1
            : heading.level === 2
              ? styles.level2
              : styles.level3;

        return (
          <li key={heading.id} className={`${styles.item} ${levelClass}`}>
            <a
              href={getHeadingHref(heading.id)}
              className={`${styles.link} ${isActive ? styles.active : ''}`}
              aria-current={isActive ? 'location' : undefined}
              onClick={(event) => handleItemClick(event, heading.id, isOpen)}
            >
              {heading.text}
            </a>
          </li>
        );
      })}
    </ul>
  );

  return (
    <nav className={styles.toc} aria-label="글 목차">
      <div className={styles.mobileToc}>
        <button
          type="button"
          className={styles.mobileToggle}
          onClick={toggle}
          aria-expanded={isOpen}
          aria-controls={mobileListId}
        >
          <HiListBullet className={styles.mobileIcon} aria-hidden="true" />
          <span className={styles.mobileTitle}>목차</span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
          >
            <HiChevronDown className={styles.mobileChevron} aria-hidden="true" />
          </motion.span>
        </button>
      </div>

      <div className={`${styles.tocPanel} ${isOpen ? styles.tocPanelOpen : ''}`} id={mobileListId}>
        <h4 className={styles.title}>목차</h4>
        <div className={styles.tocBody}>{renderItems()}</div>
      </div>
    </nav>
  );
}
