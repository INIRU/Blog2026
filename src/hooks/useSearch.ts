import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Post } from '@/lib/supabase/database.types';

export interface Suggestion {
  slug: string;
  title: string;
}

export function useSearch() {
  const [results, setResults] = useState<Post[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

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

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    results,
    suggestions,
    isLoading,
    hasSearched,
    search,
    fetchSuggestions,
    clearSuggestions,
  };
}
