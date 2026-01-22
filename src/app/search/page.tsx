'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { PostCard } from '@/components/post/PostCard';
import { HiSearch, HiClock } from 'react-icons/hi';
import type { Post } from '@/lib/supabase/database.types';
import styles from '@/styles/pages/search/page.module.css';

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
};

const gridVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 }
  },
};

interface Suggestion {
  slug: string;
  title: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Post[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, 300);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setShowSuggestions(false);

    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('published', true)
      .or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
      .order('published_at', { ascending: false });

    setResults(data ?? []);
    setIsLoading(false);
  }, []);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const { data } = await supabase
      .from('posts')
      .select('slug, title')
      .eq('published', true)
      .ilike('title', `%${searchQuery}%`)
      .order('published_at', { ascending: false })
      .limit(5);

    setSuggestions(data ?? []);
  }, []);

  useEffect(() => {
    if (initialQuery) {
      search(initialQuery);
    }
  }, [initialQuery, search]);

  useEffect(() => {
    if (debouncedQuery && !hasSearched) {
      fetchSuggestions(debouncedQuery);
      setShowSuggestions(true);
    }
  }, [debouncedQuery, fetchSuggestions, hasSearched]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
      search(query);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.title);
    setShowSuggestions(false);
    router.push(`/posts/${suggestion.slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setHasSearched(false);
    setSelectedIndex(-1);
    if (e.target.value.length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  return (
    <motion.div 
      className={styles.container}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div className={styles.header} variants={itemVariants}>
        <h1 className={styles.title}>검색</h1>
        <p className={styles.description}>
          블로그 글을 검색해보세요.
        </p>
      </motion.div>

      <motion.form 
        onSubmit={handleSubmit} 
        className={styles.searchForm}
        variants={itemVariants}
      >
        <div className={styles.searchInputWrapper}>
          <HiSearch className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="검색어를 입력하세요..."
            className={styles.searchInput}
            autoFocus
            autoComplete="off"
          />
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.ul
                className={styles.suggestions}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                {suggestions.map((suggestion, index) => (
                  <li key={suggestion.slug}>
                    <button
                      type="button"
                      className={`${styles.suggestionItem} ${index === selectedIndex ? styles.selected : ''}`}
                      onMouseDown={() => handleSuggestionClick(suggestion)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <HiClock className={styles.suggestionIcon} />
                      <span>{suggestion.title}</span>
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
        <button type="submit" className={styles.searchButton}>
          검색
        </button>
      </motion.form>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            className={styles.loading}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            검색 중...
          </motion.div>
        ) : hasSearched ? (
          results.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.p className={styles.resultCount} variants={itemVariants}>
                &quot;{initialQuery}&quot; 검색 결과 {results.length}개
              </motion.p>
              <motion.div 
                className={styles.results}
                variants={gridVariants}
                initial="initial"
                animate="animate"
              >
                {results.map((post) => (
                  <motion.div key={post.id} variants={cardVariants}>
                    <PostCard post={post} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              className={styles.empty}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <p>&quot;{initialQuery}&quot;에 대한 검색 결과가 없습니다.</p>
            </motion.div>
          )
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className={styles.container}><div className={styles.loading}>로딩 중...</div></div>}>
      <SearchContent />
    </Suspense>
  );
}
