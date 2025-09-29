import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { EntitySuggestion } from '@/types/entities';
import { getEntityClass } from '@/utils/entityUtils';

interface TagSelectorProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  suggestions: EntitySuggestion[];
  placeholder?: string;
}

export const TagSelector = ({ tags, onTagsChange, suggestions, placeholder = "Add tags..." }: TagSelectorProps) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<EntitySuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !tags.some(tag => tag.toLowerCase() === suggestion.name.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 5));
      setSelectedIndex(-1);
    } else {
      setFilteredSuggestions([]);
    }
  }, [inputValue, suggestions, tags]);

  const addTag = (tagName: string) => {
    const trimmed = tagName.trim();
    if (trimmed && !tags.some(tag => tag.toLowerCase() === trimmed.toLowerCase())) {
      onTagsChange([...tags, trimmed]);
      setInputValue('');
      setFilteredSuggestions([]);
    }
  };

  const removeTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
          addTag(filteredSuggestions[selectedIndex].name);
        } else if (inputValue.trim()) {
          addTag(inputValue);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Escape':
        setFilteredSuggestions([]);
        setSelectedIndex(-1);
        break;
      case 'Backspace':
        if (!inputValue && tags.length > 0) {
          removeTag(tags.length - 1);
        }
        break;
    }
  };

  return (
    <div className="space-y-2">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, index) => {
            const suggestion = suggestions.find(s => s.name.toLowerCase() === tag.toLowerCase());
            const entityClass = suggestion ? getEntityClass(suggestion.type) : 'entity-tag entity-npc';
            
            return (
              <Badge key={index} variant="secondary" className={entityClass}>
                {tag}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 text-current hover:bg-transparent"
                  onClick={() => removeTag(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
      
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        
        {filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-40 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={suggestion.name}
                type="button"
                className={`w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground ${
                  index === selectedIndex ? 'bg-accent text-accent-foreground' : ''
                }`}
                onClick={() => addTag(suggestion.name)}
              >
                <div className="flex items-center justify-between">
                  <span>{suggestion.name}</span>
                  <span className={`text-xs px-1 ${getEntityClass(suggestion.type)}`}>
                    {suggestion.type}
                  </span>
                </div>
              </button>
            ))}
            {inputValue.trim() && !filteredSuggestions.some(s => s.name.toLowerCase() === inputValue.trim().toLowerCase()) && (
              <button
                type="button"
                className={`w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground ${
                  selectedIndex === filteredSuggestions.length ? 'bg-accent text-accent-foreground' : ''
                }`}
                onClick={() => addTag(inputValue)}
              >
                <div className="flex items-center gap-2">
                  <Plus className="h-3 w-3" />
                  <span>Create "{inputValue.trim()}" (new)</span>
                </div>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};