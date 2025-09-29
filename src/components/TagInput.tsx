import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { LocalEntity } from "@/services/localStorageService";

interface EntityForSuggestions {
  name: string;
  type: string;
}

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  existingEntities: EntityForSuggestions[];
  placeholder?: string;
}

export const TagInput = ({ tags, onTagsChange, existingEntities, placeholder = "Add tags..." }: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<EntityForSuggestions[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const getEntityClass = (entityType: string): string => {
    switch (entityType.toLowerCase()) {
      case 'player': case 'pc': return 'entity-player';
      case 'character': case 'npc': return 'entity-npc';
      case 'location': case 'place': case 'city': return 'entity-location';
      case 'item': case 'weapon': case 'artifact': return 'entity-item';
      case 'organization': case 'guild': case 'faction': return 'entity-organization';
      default: return 'entity-npc';
    }
  };

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = existingEntities
        .filter(entity => 
          entity.name.toLowerCase().includes(inputValue.toLowerCase()) &&
          !tags.includes(entity.name.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedSuggestion(0);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, existingEntities, tags]);

  const addTag = (tag: string) => {
    const cleanTag = tag.trim().toLowerCase();
    if (cleanTag && !tags.includes(cleanTag)) {
      onTagsChange([...tags, cleanTag]);
    }
    setInputValue("");
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (showSuggestions && suggestions[selectedSuggestion]) {
        addTag(suggestions[selectedSuggestion].name);
      } else if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "ArrowDown" && showSuggestions) {
      e.preventDefault();
      setSelectedSuggestion(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp" && showSuggestions) {
      e.preventDefault();
      setSelectedSuggestion(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <Badge 
            key={tag} 
            variant="outline" 
            className={`entity-tag ${getEntityClass(tag)} text-xs`}
          >
            #{tag}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
              onClick={() => removeTag(tag)}
            />
          </Badge>
        ))}
      </div>
      
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="bg-input border-border text-foreground placeholder:text-muted-foreground"
        />
        
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 z-10 bg-card border border-border mt-1 max-h-32 overflow-y-auto fantasy-scrollbar">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.name}
                onClick={() => addTag(suggestion.name)}
                className={`px-3 py-2 cursor-pointer text-sm flex items-center gap-2 ${
                  index === selectedSuggestion ? 'bg-muted' : 'hover:bg-muted/50'
                }`}
              >
                <Badge variant="outline" className={`entity-tag ${getEntityClass(suggestion.type)} text-xs`}>
                  #{suggestion.name}
                </Badge>
                <span className="text-muted-foreground text-xs">({suggestion.type})</span>
              </div>
            ))}
            {inputValue.trim() && !suggestions.some(s => s.name.toLowerCase() === inputValue.trim().toLowerCase()) && (
              <div
                onClick={() => addTag(inputValue)}
                className={`px-3 py-2 cursor-pointer text-sm flex items-center gap-2 border-t border-border ${
                  selectedSuggestion === suggestions.length ? 'bg-muted' : 'hover:bg-muted/50'
                }`}
              >
                <Plus className="h-3 w-3" />
                <span>Create "#{inputValue.trim().toLowerCase()}" (new)</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};