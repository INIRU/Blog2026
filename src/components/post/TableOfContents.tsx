'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { HiChevronDown, HiListBullet } from 'react-icons/hi2';
import Slugger from 'github-slugger';
import styles from '@/styles/components/post/TableOfContents.module.css';
import { useToggle } from '@/hooks/useToggle';

interface TocItem {
  id: string;
  text: string;
  level: 1 | 2 | 3;
}

interface TocParent {
  item: TocItem;
  children: TocItem[];
}

interface ActiveState {
  activeId: string;
  activeParentId: string;
}

interface TableOfContentsProps {
  content: string;
}

const CONTENT_ID = 'markdown-content';
const SCROLL_OFFSET = 112;
const ACTIVE_OFFSET_TOLERANCE = 8;

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

const findParentId = (items: TocParent[], id: string) => {
  for (const parent of items) {
    if (parent.item.id === id) return parent.item.id;
    if (parent.children.some((child) => child.id === id)) return parent.item.id;
  }

  return id;
};

const buildTocTree = (headings: TocItem[]) => {
  const parents: TocParent[] = [];
  let currentParent: TocParent | null = null;

  headings.forEach((heading) => {
    if (heading.level === 1 || heading.level === 2) {
      currentParent = { item: heading, children: [] };
      parents.push(currentParent);
      return;
    }

    if (currentParent) {
      currentParent.children.push(heading);
    }
  });

  return parents;
};

const areHeadingsEqual = (current: TocItem[], next: TocItem[]) =>
  current.length === next.length &&
  current.every(
    (item, index) =>
      item.id === next[index].id &&
      item.text === next[index].text &&
      item.level === next[index].level,
  );

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeState, setActiveState] = useState<ActiveState>({
    activeId: '',
    activeParentId: '',
  });
  const activeStateRef = useRef(activeState);
  const frameRef = useRef<number | null>(null);
  const collectFrameRef = useRef<number | null>(null);
  const { value: isOpen, toggle, setOff } = useToggle(false);
  const mobileListId = useId();
  const shouldReduceMotion = useReducedMotion();

  const tocItems = useMemo(() => buildTocTree(headings), [headings]);

  const updateActiveState = useCallback(
    (activeId: string) => {
      if (!activeId) return;

      const activeParentId = findParentId(tocItems, activeId);
      const nextState = { activeId, activeParentId };
      const currentState = activeStateRef.current;

      if (
        currentState.activeId === nextState.activeId &&
        currentState.activeParentId === nextState.activeParentId
      ) {
        return;
      }

      activeStateRef.current = nextState;
      setActiveState(nextState);
    },
    [tocItems],
  );

  const scheduleActiveSync = useCallback(
    (forcedId?: string) => {
      if (frameRef.current !== null) return;

      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        updateActiveState(forcedId ?? getCurrentActiveId(headings));
      });
    },
    [headings, updateActiveState],
  );

  useEffect(() => {
    activeStateRef.current = activeState;
  }, [activeState]);

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
    if (headings.length === 0 || tocItems.length === 0) return;

    scheduleActiveSync();

    const handleScroll = () => scheduleActiveSync();
    const handleResize = () => scheduleActiveSync();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [headings, scheduleActiveSync, tocItems.length]);

  const scrollToHeading = useCallback(
    (id: string) => {
      const element = document.getElementById(id);
      if (!element) return;

      const nextHash = `#${encodeURIComponent(id)}`;
      const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;
      const top = element.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;

      window.history.pushState(null, '', nextUrl);
      updateActiveState(id);
      window.scrollTo({
        top: Math.max(0, top),
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    },
    [updateActiveState],
  );

  const handleLinkClick = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    id: string,
    closeMobile = false,
  ) => {
    if (!id) return;

    event.preventDefault();
    if (closeMobile) setOff();
    scrollToHeading(id);
  };

  if (tocItems.length === 0) return null;

  const renderItems = (isMobile = false) => (
    <ul className={isMobile ? styles.mobileList : styles.list}>
      {tocItems.map((parent) => {
        const hasChildren = parent.children.length > 0;
        const isExpanded = activeState.activeParentId === parent.item.id;
        const isActiveParent = activeState.activeId === parent.item.id;
        const childrenTransition = shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.22, ease: [0.22, 1, 0.36, 1] };

        return (
          <li key={parent.item.id} className={styles.item}>
            <a
              href={`#${parent.item.id}`}
              className={`${isMobile ? styles.mobileLink : styles.link} ${
                isActiveParent ? styles.active : ''
              }`}
              aria-current={isActiveParent ? 'location' : undefined}
              aria-expanded={hasChildren ? isExpanded : undefined}
              onClick={(event) => handleLinkClick(event, parent.item.id, isMobile)}
            >
              {parent.item.text}
            </a>

            <AnimatePresence initial={false}>
              {hasChildren && isExpanded && (
                <motion.ul
                  key={`${parent.item.id}-children`}
                  className={isMobile ? styles.mobileChildren : styles.children}
                  initial={{ height: 0, opacity: 0, y: shouldReduceMotion ? 0 : -4 }}
                  animate={{ height: 'auto', opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: shouldReduceMotion ? 0 : -4 }}
                  transition={childrenTransition}
                >
                  {parent.children.map((child) => {
                    const isActiveChild = activeState.activeId === child.id;

                    return (
                      <li key={child.id} className={styles.childItem}>
                        <a
                          href={`#${child.id}`}
                          className={`${isMobile ? styles.mobileChildLink : styles.childLink} ${
                            isActiveChild ? styles.active : ''
                          }`}
                          aria-current={isActiveChild ? 'location' : undefined}
                          onClick={(event) => handleLinkClick(event, child.id, isMobile)}
                        >
                          {child.text}
                        </a>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <nav className={styles.toc} aria-label="글 목차">
        <h4 className={styles.title}>목차</h4>
        <div className={styles.tocBody}>{renderItems()}</div>
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
          <span className={styles.mobileTitle}>목차</span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
          >
            <HiChevronDown className={styles.mobileChevron} aria-hidden="true" />
          </motion.span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.nav
              className={styles.mobileDropdown}
              id={mobileListId}
              aria-label="글 목차"
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.16 }}
            >
              {renderItems(true)}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
