import { useState } from "react";
import { Send, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TagInput } from "@/components/TagInput";

interface Thought {
  id: string;
  content: string;
  entities: string[];
  timestamp: Date;
  gameDate?: string;
}

interface ChatWindowProps {
  onThoughtAdded?: (thought: Thought) => void;
  existingEntities?: string[];
}

export const ChatWindow = ({ onThoughtAdded, existingEntities = [] }: ChatWindowProps) => {
  const [content, setContent] = useState("");
  const [gameDate, setGameDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const extractEntities = (text: string): string[] => {
    const entityRegex = /#(\w+)/g;
    const matches = text.match(entityRegex);
    return matches ? matches.map(match => match.slice(1).toLowerCase()) : [];
  };

  const handleSubmit = () => {
    if (content.trim().length === 0) return;
    
    const contentEntities = extractEntities(content);
    const allEntities = [...new Set([...contentEntities, ...tags])];
    const thought: Thought = {
      id: Date.now().toString(),
      content: content.trim(),
      entities: allEntities,
      timestamp: new Date(),
      gameDate: gameDate || undefined,
    };

    onThoughtAdded?.(thought);
    setContent("");
    setTags([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const renderContentWithEntities = (text: string) => {
    const parts = text.split(/(#\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        const entityType = part.slice(1).toLowerCase();
        const entityClass = getEntityClass(entityType);
        return (
          <Badge key={index} variant="outline" className={`entity-tag ${entityClass} mx-1`}>
            {part}
          </Badge>
        );
      }
      return part;
    });
  };

  const getEntityClass = (entityType: string): string => {
    if (entityType.includes('player') || entityType.includes('pc')) return 'entity-player';
    if (entityType.includes('npc') || entityType.includes('character')) return 'entity-npc';
    if (entityType.includes('location') || entityType.includes('place') || entityType.includes('city')) return 'entity-location';
    if (entityType.includes('item') || entityType.includes('weapon') || entityType.includes('artifact')) return 'entity-item';
    if (entityType.includes('guild') || entityType.includes('organization') || entityType.includes('faction')) return 'entity-organization';
    return 'entity-npc'; // default
  };

  const characterCount = content.length;
  const isOverLimit = characterCount > 500;

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-foreground">
          <Hash className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Record your Thoughts</h2>
        </div>
        
        <div className="space-y-3">
          <div className="relative">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Record your thoughts... You can also add #tags inline or use the tag input below."
              className="min-h-[120px] bg-input border-border text-foreground placeholder:text-muted-foreground resize-none fantasy-scrollbar"
              maxLength={600}
            />
            <div className={`absolute bottom-2 right-2 text-xs ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
              {characterCount}/500
            </div>
          </div>

          {content && (
            <div className="p-3 bg-muted/30 border border-border">
              <div className="text-sm text-muted-foreground mb-2">Preview:</div>
              <div className="text-sm text-foreground">
                {renderContentWithEntities(content)}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Tags</label>
              <TagInput
                tags={tags}
                onTagsChange={setTags}
                existingEntities={existingEntities}
                placeholder="Add entity tags (e.g., player-thara, location-waterdeep)..."
              />
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
          You can use #tags inline or the dedicated tag input. Press Ctrl+Enter to submit quickly.
        </div>
      </div>
    </Card>
  );
};