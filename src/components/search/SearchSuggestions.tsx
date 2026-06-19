import { motion, AnimatePresence } from 'framer-motion';
import { HiClock } from 'react-icons/hi';
import styles from '@/styles/pages/search/page.module.css';
import type { Suggestion } from '@/hooks/useSearch';

interface SearchSuggestionsProps {
  suggestions: Suggestion[];
  show: boolean;
  selectedIndex: number;
  onSelect: (suggestion: Suggestion) => void;
  onHover: (index: number) => void;
}

export function SearchSuggestions({ 
  suggestions, 
  show, 
  selectedIndex, 
  onSelect, 
  onHover 
}: SearchSuggestionsProps) {
  return (
    <AnimatePresence>
      {show && suggestions.length > 0 && (
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
                onMouseDown={() => onSelect(suggestion)}
                onMouseEnter={() => onHover(index)}
              >
                <HiClock className={styles.suggestionIcon} />
                <span>{suggestion.title}</span>
              </button>
            </li>
          ))}
        </motion.ul>
      )}
    </AnimatePresence>
  );
}
