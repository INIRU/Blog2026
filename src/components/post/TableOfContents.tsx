'use client';

import {
  type MouseEvent,
  type PointerEvent,
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
const PROGRAMMATIC_ALIGNMENT_TOLERANCE = 24;
const PROGRAMMATIC_ALIGNMENT_RETRY_DELAYS = [80, 180, 360, 720, 900] as const;
const TOC_CENTER_BAND_START = 0.35;
const TOC_CENTER_BAND_END = 0.65;
const handledTocClickEvents = new WeakSet<globalThis.Event>();

const isPrimaryUnmodifiedClick = (event: globalThis.MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

const getTocLinkFromEvent = (event: globalThis.Event) => {
  if (!(event.target instanceof Element)) return null;

  return event.target.closest<HTMLAnchorElement>('a[data-toc-link="true"][data-toc-id]');
};

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

const getHeadingOffsetDistance = (element: HTMLElement) =>
  element.getBoundingClientRect().top - SCROLL_OFFSET;

const getHeadingScrollTop = (element: HTMLElement) =>
  Math.max(0, element.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET);

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  const activeIdRef = useRef(activeId);
  const frameRef = useRef<number | null>(null);
  const centerFrameRef = useRef<number | null>(null);
  const collectFrameRef = useRef<number | null>(null);
  const programmaticTargetIdRef = useRef<string | null>(null);
  const programmaticTargetTimeoutRef = useRef<number | null>(null);
  const programmaticAlignmentFrameRef = useRef<number | null>(null);
  const programmaticAlignmentTimerRefs = useRef<number[]>([]);
  const programmaticAlignmentRetryDeadlineRef = useRef(0);
  const tocPanelRef = useRef<HTMLDivElement | null>(null);
  const activeLinkRef = useRef<HTMLAnchorElement | null>(null);
  const pendingPointerIdRef = useRef<string | null>(null);
  const clickActivationFrameRef = useRef<number | null>(null);
  const clickActivationTimerRef = useRef<number | null>(null);
  const { value: isOpen, toggle, setOff } = useToggle(false);
  const mobileListId = useId();
  const shouldReduceMotion = useReducedMotion();

  const updateActiveId = useCallback((nextActiveId: string) => {
    if (!nextActiveId || activeIdRef.current === nextActiveId) return;

    activeIdRef.current = nextActiveId;
    setActiveId(nextActiveId);
  }, []);

  const clearAlignmentRetries = useCallback(() => {
    if (programmaticAlignmentFrameRef.current !== null) {
      cancelAnimationFrame(programmaticAlignmentFrameRef.current);
      programmaticAlignmentFrameRef.current = null;
    }

    programmaticAlignmentTimerRefs.current.forEach((timerId) => {
      window.clearTimeout(timerId);
    });
    programmaticAlignmentTimerRefs.current = [];
    programmaticAlignmentRetryDeadlineRef.current = 0;
  }, []);

  const clearProgrammaticTarget = useCallback((targetId?: string) => {
    if (targetId && programmaticTargetIdRef.current !== targetId) return;

    programmaticTargetIdRef.current = null;
    if (programmaticTargetTimeoutRef.current !== null) {
      window.clearTimeout(programmaticTargetTimeoutRef.current);
      programmaticTargetTimeoutRef.current = null;
    }
    clearAlignmentRetries();
  }, [clearAlignmentRetries]);

  const alignToHeading = useCallback(
    (targetId: string, behavior: ScrollBehavior, { force = false }: { force?: boolean } = {}) => {
      const element = document.getElementById(targetId);
      if (!(element instanceof HTMLElement)) return;

      if (
        !force &&
        Math.abs(getHeadingOffsetDistance(element)) <= PROGRAMMATIC_ALIGNMENT_TOLERANCE
      ) {
        return;
      }

      window.scrollTo({
        top: getHeadingScrollTop(element),
        behavior,
      });
    },
    [],
  );

  const scheduleAlignmentRetries = useCallback(
    (targetId: string) => {
      clearAlignmentRetries();
      programmaticAlignmentRetryDeadlineRef.current =
        window.performance.now() +
        PROGRAMMATIC_ALIGNMENT_RETRY_DELAYS[PROGRAMMATIC_ALIGNMENT_RETRY_DELAYS.length - 1];

      const alignTarget = () => {
        if (programmaticAlignmentFrameRef.current !== null) {
          cancelAnimationFrame(programmaticAlignmentFrameRef.current);
        }

        programmaticAlignmentFrameRef.current = requestAnimationFrame(() => {
          programmaticAlignmentFrameRef.current = null;
          if (programmaticTargetIdRef.current !== targetId) return;

          alignToHeading(targetId, 'auto');
        });
      };

      alignTarget();
      programmaticAlignmentTimerRefs.current = PROGRAMMATIC_ALIGNMENT_RETRY_DELAYS.map((delay) =>
        window.setTimeout(alignTarget, delay),
      );
    },
    [alignToHeading, clearAlignmentRetries],
  );

  const centerActiveItemInPanel = useCallback(
    ({ immediate = false }: { immediate?: boolean } = {}) => {
      if (centerFrameRef.current !== null) {
        cancelAnimationFrame(centerFrameRef.current);
      }

      centerFrameRef.current = requestAnimationFrame(() => {
        centerFrameRef.current = null;
        const panel = tocPanelRef.current;
        const activeLink = activeLinkRef.current;

        if (!panel || !activeLink || panel.scrollHeight <= panel.clientHeight) return;

        const panelRect = panel.getBoundingClientRect();
        const activeRect = activeLink.getBoundingClientRect();
        const activeCenter = activeRect.top + activeRect.height / 2;
        const middleBandTop = panelRect.top + panelRect.height * TOC_CENTER_BAND_START;
        const middleBandBottom = panelRect.top + panelRect.height * TOC_CENTER_BAND_END;

        if (activeCenter >= middleBandTop && activeCenter <= middleBandBottom) return;

        const panelCenter = panelRect.top + panelRect.height / 2;
        const maxScrollTop = panel.scrollHeight - panel.clientHeight;
        const nextScrollTop = Math.min(
          maxScrollTop,
          Math.max(0, panel.scrollTop + activeCenter - panelCenter),
        );

        panel.scrollTo({
          top: nextScrollTop,
          behavior: immediate || shouldReduceMotion ? 'auto' : 'smooth',
        });
      });
    },
    [shouldReduceMotion],
  );

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
    const hydrationTimer = window.setTimeout(() => {
      setIsHydrated(true);
    }, 0);

    return () => window.clearTimeout(hydrationTimer);
  }, []);

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
      const targetId = programmaticTargetIdRef.current;
      if (!targetId) return;
      if (window.performance.now() < programmaticAlignmentRetryDeadlineRef.current) return;

      const element = document.getElementById(targetId);
      if (
        element instanceof HTMLElement &&
        Math.abs(getHeadingOffsetDistance(element)) > PROGRAMMATIC_ALIGNMENT_TOLERANCE
      ) {
        return;
      }

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
      if (centerFrameRef.current !== null) {
        cancelAnimationFrame(centerFrameRef.current);
        centerFrameRef.current = null;
      }
    };
  }, [clearProgrammaticTarget, headings, scheduleActiveSync]);

  useEffect(() => {
    if (!activeId || headings.length === 0) return;

    centerActiveItemInPanel();
  }, [activeId, centerActiveItemInPanel, headings.length]);

  useEffect(() => {
    if (!isOpen || !activeId) return;

    centerActiveItemInPanel({ immediate: true });
  }, [activeId, centerActiveItemInPanel, isOpen]);

  const scrollToHeading = useCallback(
    (id: string) => {
      const element = document.getElementById(id);
      if (!element) return;

      const nextHash = `#${encodeURIComponent(id)}`;
      const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;

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
      alignToHeading(id, prefersReducedMotion() ? 'auto' : 'smooth', { force: true });
      scheduleAlignmentRetries(id);

      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '-1');
      }
      element.focus({ preventScroll: true });
      centerActiveItemInPanel();
    },
    [
      centerActiveItemInPanel,
      alignToHeading,
      clearProgrammaticTarget,
      scheduleActiveSync,
      scheduleAlignmentRetries,
      updateActiveId,
    ],
  );

  const activateHeading = useCallback(
    (id: string, closeMobile = false) => {
      if (closeMobile) setOff();
      scrollToHeading(id);
    },
    [scrollToHeading, setOff],
  );

  const scheduleHeadingActivation = useCallback(
    (id: string, closeMobile = false) => {
      if (clickActivationFrameRef.current !== null) {
        cancelAnimationFrame(clickActivationFrameRef.current);
      }
      if (clickActivationTimerRef.current !== null) {
        window.clearTimeout(clickActivationTimerRef.current);
      }

      clickActivationFrameRef.current = requestAnimationFrame(() => {
        clickActivationFrameRef.current = null;
        clickActivationTimerRef.current = window.setTimeout(() => {
          clickActivationTimerRef.current = null;
          activateHeading(id, closeMobile);
        }, 0);
      });
    },
    [activateHeading],
  );

  useEffect(
    () => () => {
      if (clickActivationFrameRef.current !== null) {
        cancelAnimationFrame(clickActivationFrameRef.current);
      }
      if (clickActivationTimerRef.current !== null) {
        window.clearTimeout(clickActivationTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const handleDocumentClick = (event: globalThis.MouseEvent) => {
      if (!isPrimaryUnmodifiedClick(event)) return;

      const tocLink = getTocLinkFromEvent(event);
      const targetId = tocLink?.dataset.tocId;
      if (!targetId || !tocPanelRef.current?.contains(tocLink)) return;

      event.preventDefault();
      handledTocClickEvents.add(event);
      pendingPointerIdRef.current = null;
      scheduleHeadingActivation(targetId, isOpen);
    };

    document.addEventListener('click', handleDocumentClick, true);

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [isOpen, scheduleHeadingActivation]);

  const handleItemPointerDown = (event: PointerEvent<HTMLAnchorElement>, id: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    pendingPointerIdRef.current = id;
  };

  const handleItemClick = (event: MouseEvent<HTMLAnchorElement>, id: string, closeMobile = false) => {
    if (handledTocClickEvents.has(event.nativeEvent)) {
      event.preventDefault();
      return;
    }

    if (
      isHydrated &&
      (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    ) {
      return;
    }

    event.preventDefault();
    const targetId = pendingPointerIdRef.current === id ? pendingPointerIdRef.current : id;
    pendingPointerIdRef.current = null;
    scheduleHeadingActivation(targetId, closeMobile);
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
              ref={isActive ? activeLinkRef : undefined}
              href={isHydrated ? getHeadingHref(heading.id) : undefined}
              className={`${styles.link} ${isActive ? styles.active : ''}`}
              aria-current={isActive ? 'location' : undefined}
              data-toc-link="true"
              data-toc-id={heading.id}
              onPointerDown={(event) => handleItemPointerDown(event, heading.id)}
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

      <div
        ref={tocPanelRef}
        className={`${styles.tocPanel} ${isOpen ? styles.tocPanelOpen : ''}`}
        id={mobileListId}
      >
        <h4 className={styles.title}>목차</h4>
        <div className={styles.tocBody}>{renderItems()}</div>
      </div>
    </nav>
  );
}
