'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { HiSearch, HiSortDescending } from 'react-icons/hi';
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

  useEffect(() => {
    setSearchValue(searchParams.get('q') || '');
    setSortValue((searchParams.get('sort') as SortOption) || 'latest');
  }, [searchParams]);

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

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <form onSubmit={handleSearch} className={styles.searchWrapper}>
          <input
            type="text"
            placeholder="검색어를 입력하세요..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton} aria-label="Search">
            <HiSearch />
          </button>
        </form>

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
