import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus, Pin } from 'lucide-react';
import { EntitySuggestion } from '@/types/entities';
import { getEntityClass } from '@/utils/entityUtils';

interface TagSelectorProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  suggestions: EntitySuggestion[];
  placeholder?: string;
  isDefaultTagSelector?: boolean;
  defaultTags?: string[];
}

export const TagSelector = ({ tags, onTagsChange, suggestions, placeholder = "Add tags...", isDefaultTagSelector = false, defaultTags = [] }: TagSelectorProps) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<EntitySuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Only show suggestions when focused and has input
    if (isFocused && inputValue.trim()) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !tags.some(tag => tag.toLowerCase() === suggestion.name.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 5));
      setSelectedIndex(-1);
    } else {
      setFilteredSuggestions([]);
    }
  }, [inputValue, suggestions, tags, isFocused]);

  const addTag = (tagName: string) => {
    const trimmed = tagName.trim();
    if (trimmed && !tags.some(tag => tag.toLowerCase() === trimmed.toLowerCase())) {
      onTagsChange([...tags, trimmed]);
      setInputValue('');
      setFilteredSuggestions([]);
    }
  };

  const addMultipleTags = (input: string) => {
    const newTags = input.split(',').map(tag => tag.trim()).filter(tag => 
      tag && !tags.some(existingTag => existingTag.toLowerCase() === tag.toLowerCase())
    );
    if (newTags.length > 0) {
      onTagsChange([...tags, ...newTags]);
      setInputValue('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Check for comma and process immediately
    if (value.includes(',')) {
      const parts = value.split(',');
      const tagsToAdd = parts.slice(0, -1).map(tag => tag.trim()).filter(tag => 
        tag && !tags.some(existingTag => existingTag.toLowerCase() === tag.toLowerCase())
      );
      
      if (tagsToAdd.length > 0) {
        onTagsChange([...tags, ...tagsToAdd]);
      }
      
      // Keep the text after the last comma
      setInputValue(parts[parts.length - 1].trim());
    } else {
      setInputValue(value);
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
          // Check if input contains commas for multiple tags
          if (inputValue.includes(',')) {
            addMultipleTags(inputValue);
          } else {
            addTag(inputValue);
          }
        }
        break;
      case 'Tab':
        e.preventDefault();
        if (inputValue.trim()) {
          if (inputValue.includes(',')) {
            addMultipleTags(inputValue);
          } else {
            addTag(inputValue);
          }
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
      {(defaultTags.length > 0 || tags.length > 0) && (
        <div className="flex flex-wrap gap-1">
          {/* Show default tags first with pin icons */}
          {defaultTags.map((tag, index) => (
            <Badge 
              key={`default-${index}`} 
              variant="outline" 
              className="entity-tag entity-default-tag text-sm"
            >
              <Pin className="h-3 w-3 mr-1" />
              #{tag}
            </Badge>
          ))}
          
          {/* Show regular tags */}
          {tags.map((tag, index) => {
            const suggestion = suggestions.find(s => s.name.toLowerCase() === tag.toLowerCase());
            const entityClass = suggestion ? getEntityClass(suggestion.type) : 'entity-tag entity-npc';
            
            return (
              <Badge 
                key={index} 
                variant="outline" 
                className={`entity-tag ${isDefaultTagSelector ? 'entity-default-tag' : entityClass} text-sm`}
              >
                {isDefaultTagSelector && <Pin className="h-3 w-3 mr-1" />}
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
      
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
        />
        
        {(filteredSuggestions.length > 0 || (isFocused && inputValue.trim())) && (
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
            {/* Always show "Create new Entity" option */}
            <button
              type="button"
              className={`w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground ${
                selectedIndex === filteredSuggestions.length ? 'bg-accent text-accent-foreground' : ''
              }`}
              onClick={() => {
                if (inputValue.trim()) {
                  if (inputValue.includes(',')) {
                    addMultipleTags(inputValue);
                  } else {
                    addTag(inputValue);
                  }
                }
              }}
            >
              <div className="flex items-center gap-2">
                <Plus className="h-3 w-3" />
                <span>
                  {inputValue.trim() 
                    ? `Create "${inputValue.trim()}" (new)` 
                    : 'Create new entity'
                  }
                </span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};