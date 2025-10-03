import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBoxProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  variant?: 'default' | 'compact' | 'large';
  showClearButton?: boolean;
  debounceMs?: number;
  initialValue?: string;
  maxLength?: number;
  onClear?: () => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  onSearch,
  placeholder = "Search tools, reflections, or insights...",
  className = "",
  autoFocus = false,
  variant = 'default',
  showClearButton = true,
  debounceMs = 300,
  initialValue = '',
  maxLength = 100,
  onClear,
  'aria-label': ariaLabel = "Search content",
  'aria-describedby': ariaDescribedBy,
}) => {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout>();

  // Handle debounced search
  useEffect(() => {
    if (debounceMs > 0) {
      clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(() => {
        onSearch(query);
      }, debounceMs);
    }
    
    return () => {
      clearTimeout(debounceTimeout.current);
    };
  }, [query, debounceMs, onSearch]);

  // Auto-focus on mount if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearTimeout(debounceTimeout.current);
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    if (onClear) {
      onClear();
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && query) {
      handleClear();
    }
  };

  // Determine size classes based on variant
  const sizeClasses = {
    compact: 'search-box-compact',
    default: 'search-box-default',
    large: 'search-box-large'
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`search-box ${sizeClasses[variant]} ${className} ${isFocused ? 'search-box-focused' : ''}`}
      role="search"
    >
      <label htmlFor="search-input" className="sr-only">
        {ariaLabel}
      </label>
      
      <div className="search-input-wrapper">
        <Search 
          className="search-icon" 
          size={variant === 'large' ? 24 : variant === 'compact' ? 16 : 20}
          aria-hidden="true"
        />
        
        <input
          ref={inputRef}
          id="search-input"
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          className="search-input"
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          maxLength={maxLength}
          autoComplete="off"
          spellCheck={false}
        />
        
        {showClearButton && query && (
          <button
            type="button"
            onClick={handleClear}
            className="search-clear-button"
            aria-label="Clear search"
          >
            <X size={variant === 'large' ? 20 : 16} />
          </button>
        )}
        
        <button 
          type="submit" 
          className="search-submit-button"
          aria-label="Submit search"
        >
          <span className="search-submit-text">Search</span>
        </button>
      </div>
      
      {/* Live region for screen readers */}
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {query ? `Searching for: ${query}` : 'Search field is empty'}
      </div>
    </form>
  );
};

export default SearchBox;