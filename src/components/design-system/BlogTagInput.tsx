import { useState, useRef, useEffect } from 'react';
import { X, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useSearchBlogTags, useBlogTags } from '@/hooks/useBlogTags';
import { cn } from '@/lib/utils';

interface BlogTagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const BlogTagInput = ({ value, onChange, placeholder = "Add tags..." }: BlogTagInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { data: searchResults = [] } = useSearchBlogTags(inputValue);
  const { data: popularTags = [] } = useBlogTags();
  
  // Filter out already selected tags from suggestions
  const filteredSuggestions = searchResults.filter(
    tag => !value.includes(tag.name)
  );
  
  const popularUnselected = popularTags
    .filter(tag => !value.includes(tag.name))
    .slice(0, 5);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredSuggestions.length]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tagName: string) => {
    const trimmed = tagName.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (filteredSuggestions.length > 0 && showSuggestions) {
        addTag(filteredSuggestions[selectedIndex]?.name || inputValue);
      } else if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    } else if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filteredSuggestions.length - 1));
    } else if (e.key === 'ArrowUp' && showSuggestions) {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={containerRef} className="relative space-y-2">
      {/* Selected Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map(tag => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 pr-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pr-8"
        />
        <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (filteredSuggestions.length > 0 || inputValue.trim()) && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredSuggestions.map((tag, index) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => addTag(tag.name)}
              className={cn(
                "w-full px-3 py-2 text-left flex items-center justify-between hover:bg-muted transition-colors",
                index === selectedIndex && "bg-muted"
              )}
            >
              <span className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                {tag.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {tag.post_count} post{tag.post_count !== 1 ? 's' : ''}
              </span>
            </button>
          ))}
          
          {/* Option to create new tag */}
          {inputValue.trim() && !filteredSuggestions.some(t => t.name.toLowerCase() === inputValue.toLowerCase()) && (
            <button
              type="button"
              onClick={() => addTag(inputValue)}
              className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-muted transition-colors border-t"
            >
              <span className="text-primary">+ Create "{inputValue}"</span>
            </button>
          )}
        </div>
      )}

      {/* Popular Tags */}
      {!showSuggestions && popularUnselected.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-muted-foreground">Popular:</span>
          {popularUnselected.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => addTag(tag.name)}
              className="text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogTagInput;
