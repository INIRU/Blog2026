'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiSearch } from 'react-icons/hi';
import styles from '@/styles/pages/search/page.module.css';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearch, Suggestion } from '@/hooks/useSearch';
import { SearchSuggestions } from '@/components/search/SearchSuggestions';
import { SearchResults } from '@/components/search/SearchResults';

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

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [query, setQuery] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, 300);
  
  const {
    results,
    suggestions,
    isLoading,
    hasSearched,
    search,
    fetchSuggestions,
  } = useSearch();

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
    setSelectedIndex(-1);
    if (e.target.value.length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
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
          <SearchSuggestions
            suggestions={suggestions}
            show={showSuggestions}
            selectedIndex={selectedIndex}
            onSelect={handleSuggestionClick}
            onHover={setSelectedIndex}
          />
        </div>
        <button type="submit" className={styles.searchButton}>
          검색
        </button>
      </motion.form>

      <SearchResults
        results={results}
        isLoading={isLoading}
        hasSearched={hasSearched}
        query={initialQuery}
      />
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
