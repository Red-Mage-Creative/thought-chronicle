import { useState } from "react";
import { Send, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TagSelector } from "@/components/forms/TagSelector";
import { Settings } from "@/components/Settings";
import { businessLogicService } from "@/services/businessLogicService";
import { useLocalThoughts, useLocalEntities, useOfflineSync } from "@/hooks/useOfflineData";
import { toast } from "sonner";
import { VALIDATION, MESSAGES } from "@/utils/constants";
import { useEntitySuggestions } from "@/hooks/useEntitySuggestions";

interface ChatWindowProps {
  defaultTags: string[];
  onDefaultTagsChange: (tags: string[]) => void;
}

export const ChatWindow = ({ defaultTags, onDefaultTagsChange }: ChatWindowProps) => {
  const [content, setContent] = useState("");
  const [gameDate, setGameDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  
  const { thoughts: localThoughts } = useLocalThoughts();
  const { entities, refreshFromStorage } = useLocalEntities();
  const { refreshSyncStatus } = useOfflineSync();
  const entitySuggestions = useEntitySuggestions(entities, localThoughts);

  const handleSubmit = async () => {
    try {
      const result = await businessLogicService.processThoughtCreation(
        content,
        tags,
        defaultTags,
        gameDate
      );
      
      // Show notification for newly created entities
      if (result.newEntitiesCreated > 0) {
        const message = businessLogicService.formatEntityCreationMessage(
          result.newEntitiesCreated,
          result.entityNames
        );
        toast.success(message);
      }
      
      // Refresh sync status and entity cache
      refreshSyncStatus();
      refreshFromStorage();
      
      // Clear form
      setContent("");
      setTags([]);
      setGameDate("");
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create thought");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const validation = businessLogicService.validateContentLength(content);

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
            existingEntities={entitySuggestions}
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
              maxLength={VALIDATION.MAX_CONTENT_DISPLAY_LENGTH}
            />
            <div className={`absolute bottom-2 right-2 text-xs ${validation.isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
              {validation.characterCount}/{VALIDATION.MAX_CONTENT_LENGTH}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Additional Tags</label>
               <TagSelector
                tags={tags}
                onTagsChange={setTags}
                suggestions={entitySuggestions}
                placeholder={MESSAGES.TAG_PLACEHOLDER}
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
              disabled={!validation.isValid}
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