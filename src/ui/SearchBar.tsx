import { useState, useRef, useCallback, useEffect } from 'react';
import type { PointItem } from '../theme/GlobeTheme';

// ---------------------------------------------------------------------------
// SearchBar — glass input with dropdown results.
// Uses .og-search-* classes from tokens.css.
// ---------------------------------------------------------------------------

interface SearchBarProps {
  onSelect: (item: PointItem) => void;
  onSearch: (query: string) => PointItem[];
  placeholder?: string;
}

export function SearchBar({
  onSelect,
  onSearch,
  placeholder = 'Search species…',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PointItem[]>([]);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const showDropdown = focused && query.length > 0 && results.length > 0;

  useEffect(() => {
    if (query.length === 0) {
      setResults([]);
      return;
    }
    setResults(onSearch(query).slice(0, 6));
    setActiveIndex(-1);
  }, [query, onSearch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = useCallback(
    (item: PointItem) => {
      onSelect(item);
      setQuery('');
      setFocused(false);
    },
    [onSelect],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showDropdown) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        const item = results[activeIndex];
        if (item) select(item);
      } else if (e.key === 'Escape') {
        setFocused(false);
      }
    },
    [showDropdown, activeIndex, results, select],
  );

  return (
    <div ref={containerRef} className="og-search" data-og="search-bar">
      <div className="og-search-input og-glass-heavy">
        <svg
          className="og-search-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Search"
          role="combobox"
          aria-expanded={showDropdown}
          aria-activedescendant={activeIndex >= 0 ? `og-search-result-${activeIndex}` : undefined}
          data-og="search-input"
        />
      </div>

      {showDropdown && (
        <div className="og-search-dropdown og-glass-heavy" role="listbox" data-og="search-dropdown">
          {results.map((item, i) => (
            <div
              key={item.id}
              id={`og-search-result-${i}`}
              className="og-search-result"
              role="option"
              aria-selected={i === activeIndex}
              onClick={() => select(item)}
              data-og="search-result"
            >
              <div className="og-rarity-dot" data-rarity={item.rarity ?? 1} />
              <div>
                <div className="og-search-name">{item.name}</div>
                {item.nameZh && <div className="og-search-sub">{item.nameZh}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
