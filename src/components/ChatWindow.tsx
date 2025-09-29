import { useState, useMemo } from "react";
import { Send, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TagInput } from "@/components/TagInput";
import { Settings } from "@/components/Settings";
import { useLocalThoughts, useLocalEntities, useOfflineSync } from "@/hooks/useOfflineData";
import { LocalThought, LocalEntity } from "@/services/localStorageService";
import { toast } from "sonner";

interface ChatWindowProps {
  defaultTags: string[];
  onDefaultTagsChange: (tags: string[]) => void;
}

export const ChatWindow = ({ defaultTags, onDefaultTagsChange }: ChatWindowProps) => {
  const [content, setContent] = useState("");
  const [gameDate, setGameDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  
  const { addThought, thoughts: localThoughts } = useLocalThoughts();
  const { entities, addEntity, refreshFromStorage } = useLocalEntities();
  const { refreshSyncStatus } = useOfflineSync();

  // Create combined suggestions from local entities and mentioned-only entities
  const combinedEntitiesForSuggestions = useMemo(() => {
    const entityMap = new Map<string, { name: string; type: string }>();
    
    // Add all formal entities
    entities.forEach(entity => {
      entityMap.set(entity.name.toLowerCase(), {
        name: entity.name,
        type: entity.type
      });
    });
    
    // Add mentioned-only entities from thoughts
    localThoughts.forEach(thought => {
      const thoughtEntities = thought.relatedEntities || [];
      thoughtEntities.forEach(entityName => {
        const key = entityName.toLowerCase();
        if (!entityMap.has(key)) {
          entityMap.set(key, {
            name: entityName,
            type: 'character' // Default type for mentioned-only entities
          });
        }
      });
    });
    
    return Array.from(entityMap.values());
  }, [entities, localThoughts]);

  const createEntitiesFromTags = (tagNames: string[]): LocalEntity[] => {
    const newEntities: LocalEntity[] = [];
    const existingEntityNames = entities.map(e => e.name.toLowerCase());
    
    tagNames.forEach(tagName => {
      if (!existingEntityNames.includes(tagName.toLowerCase())) {
        // Determine entity type based on tag name (simple heuristic)
        let entityType = 'character';
        if (tagName.toLowerCase().includes('city') || tagName.toLowerCase().includes('town')) {
          entityType = 'location';
        } else if (tagName.toLowerCase().includes('guild') || tagName.toLowerCase().includes('org')) {
          entityType = 'organization';
        } else if (tagName.toLowerCase().includes('sword') || tagName.toLowerCase().includes('item')) {
          entityType = 'item';
        }
        
        // Actually create the entity in localStorage
        const createdEntity = addEntity({
          name: tagName,
          type: entityType,
          description: `Auto-created from tag: ${tagName}`,
          lastMentioned: new Date(),
          count: 0
        });
        
        newEntities.push(createdEntity);
        console.log(`Created entity: ${tagName} (${entityType})`);
      }
    });
    
    return newEntities;
  };

  const handleSubmit = () => {
    if (content.trim().length === 0) return;
    
    // Combine manual tags with default tags
    const allTags = [...new Set([...defaultTags, ...tags])];
    
    // Create entities for new tags
    const newEntities = createEntitiesFromTags(allTags);
    
    // Show notification for newly created entities
    if (newEntities.length > 0) {
      const entityNames = newEntities.map(e => e.name).join(', ');
      toast.success(`Created ${newEntities.length} new entit${newEntities.length === 1 ? 'y' : 'ies'}: ${entityNames}`);
    }
    
    // Create thought in MongoDB-compatible format
    const thoughtData = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: content.trim(),
      relatedEntities: allTags,
      timestamp: new Date(),
      gameDate: gameDate || undefined
    };

    // Add thought to local storage
    addThought(thoughtData);
    
    // Refresh sync status to update pending count
    refreshSyncStatus();
    
    // Clear form
    setContent("");
    setTags([]);
    setGameDate("");
    
    // Refresh entity cache
    refreshFromStorage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };


  const characterCount = content.length;
  const isOverLimit = characterCount > 500;

  return (
    <Card className="bg-card border-border max-w-2xl mx-auto">
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-foreground">
            <Hash className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Record your Thoughts</h2>
          </div>
           <Settings 
            defaultTags={defaultTags}
            onDefaultTagsChange={onDefaultTagsChange}
            existingEntities={combinedEntitiesForSuggestions}
          />
        </div>
        
        <div className="space-y-3">
          <div className="relative">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Record your thoughts about your D&D session..."
              className="min-h-[120px] bg-input border-border text-foreground placeholder:text-muted-foreground resize-none fantasy-scrollbar"
              maxLength={600}
            />
            <div className={`absolute bottom-2 right-2 text-xs ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
              {characterCount}/500
            </div>
          </div>


          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Additional Tags</label>
               <TagInput
                tags={tags}
                onTagsChange={setTags}
                existingEntities={combinedEntitiesForSuggestions}
                placeholder="Add additional entity tags..."
              />
              {defaultTags.length > 0 && (
                <div className="mt-2 p-2 bg-muted/20 border border-border rounded text-xs">
                  <span className="text-muted-foreground">Default tags will be added automatically: </span>
                  {defaultTags.map(tag => (
                    <Badge key={tag} variant="outline" className="ml-1 text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={gameDate}
              onChange={(e) => setGameDate(e.target.value)}
              placeholder="Game date (optional)"
              className="flex-1 px-3 py-2 bg-input border border-border text-foreground placeholder:text-muted-foreground text-sm"
            />
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isOverLimit}
              className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
            >
              <Send className="h-4 w-4 mr-2" />
              Record
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <strong>Tip:</strong> Add tags to track entities like players, NPCs, locations, items, and organizations.
          Press Ctrl+Enter to submit quickly.
        </div>
      </div>
    </Card>
  );
};