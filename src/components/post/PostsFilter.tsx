'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { HiSearch, HiSortDescending } from 'react-icons/hi';
import { useSearch } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';
import styles from '@/styles/components/post/PostsFilter.module.css';

interface PostsFilterProps {
  tags: string[];
  currentTag?: string;
}

type SortOption = 'latest' | 'oldest' | 'popular';

export function PostsFilter({ tags, currentTag }: PostsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');
  const [sortValue, setSortValue] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'latest');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { suggestions, fetchSuggestions, clearSuggestions } = useSearch();
  const debouncedSearchValue = useDebounce(searchValue, 300);

  useEffect(() => {
    setSearchValue(searchParams.get('q') || '');
    setSortValue((searchParams.get('sort') as SortOption) || 'latest');
  }, [searchParams]);

  useEffect(() => {
    if (debouncedSearchValue.trim().length >= 2) {
      fetchSuggestions(debouncedSearchValue);
      setShowSuggestions(true);
    } else {
      clearSuggestions();
      setShowSuggestions(false);
    }
  }, [debouncedSearchValue, fetchSuggestions, clearSuggestions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    params.delete('page');

    router.push(`/posts?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    updateParams({ q: searchValue || null });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value as SortOption;
    setSortValue(newSort);
    updateParams({ sort: newSort === 'latest' ? null : newSort });
  };

  const handleTagChange = (tag: string) => {
    updateParams({ tag: tag || null });
  };

  const handleSuggestionClick = (slug: string) => {
    setShowSuggestions(false);
    router.push(`/posts/${slug}`);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.topBar}>
        <div className={styles.searchContainer}>
          <form onSubmit={handleSearch} className={styles.searchWrapper}>
            <input
              type="text"
              placeholder="검색어를 입력하세요..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton} aria-label="Search">
              <HiSearch />
            </button>

            {showSuggestions && suggestions.length > 0 && (
              <div className={styles.suggestionsWrapper}>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.slug}
                    type="button"
                    className={styles.suggestionItem}
                    onClick={() => handleSuggestionClick(suggestion.slug)}
                  >
                    {suggestion.title}
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>

        <div className={styles.sortWrapper}>
          <HiSortDescending className={styles.sortIcon} />
          <select
            value={sortValue}
            onChange={handleSortChange}
            className={styles.sortSelect}
          >
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="popular">조회수순</option>
          </select>
        </div>
      </div>

      <div className={styles.tagsWrapper}>
        <button
          className={`${styles.tagButton} ${!currentTag ? styles.active : ''}`}
          onClick={() => handleTagChange('')}
        >
          전체
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            className={`${styles.tagButton} ${
              currentTag === tag ? styles.active : ''
            }`}
            onClick={() => handleTagChange(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
