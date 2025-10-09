import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { TagSelector } from "./TagSelector";
import { Settings } from "@/components/Settings";
import { EntitySuggestion } from "@/types/entities";
import { Pin, X } from "lucide-react";

/**
 * ThoughtForm - Thought creation/editing form
 *
 * Note: This form works with entity NAMES (user-friendly), but the underlying
 * service layer (v1.3.0+) stores entity references as IDs internally for data integrity.
 * The conversion from names to IDs happens automatically in thoughtService.
 */
interface ThoughtFormProps {
  onSubmit: (content: string, tags: string[], gameDate?: string) => Promise<void>;
  suggestions: EntitySuggestion[];
  defaultTags?: string[];
  initialData?: {
    content: string;
    relatedEntities: string[]; // Entity names (display format)
    gameDate?: string;
  };
  isEditMode?: boolean;
  showSettings?: boolean;
  onDefaultTagsChange?: (tags: string[]) => void;
  existingEntities?: EntitySuggestion[];
  onFormStateChange?: (state: {
    isSaveDisabled: boolean;
    hasUnsavedChanges: boolean;
    isSubmitting: boolean;
    handleSubmit: () => void;
  }) => void;
}

export const ThoughtForm = ({
  onSubmit,
  suggestions,
  defaultTags = [],
  initialData,
  isEditMode = false,
  showSettings = false,
  onDefaultTagsChange,
  existingEntities = [],
  onFormStateChange,
}: ThoughtFormProps) => {
  const [content, setContent] = useState(initialData?.content || "");
  const [tags, setTags] = useState<string[]>(
    initialData?.relatedEntities?.filter((entity) => !defaultTags.includes(entity)) || [],
  );
  const [gameDate, setGameDate] = useState(initialData?.gameDate || "");
  const [useDefaultTags, setUseDefaultTags] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  const allTags = useDefaultTags ? [...defaultTags, ...tags] : [...tags];
  const isContentValid = content.trim().length > 0 && content.length <= 2000;

  // Track unsaved changes and notify parent
  useEffect(() => {
    const contentChanged = content !== (initialData?.content || "");
    const tagsChanged = JSON.stringify(allTags.sort()) !== JSON.stringify((initialData?.relatedEntities || []).sort());
    const dateChanged = gameDate !== (initialData?.gameDate || "");

    const unsaved = contentChanged || tagsChanged || dateChanged;
    setHasUnsavedChanges(unsaved);

    onFormStateChange?.({
      isSaveDisabled: !isContentValid,
      hasUnsavedChanges: unsaved,
      isSubmitting,
      handleSubmit,
    });
  }, [content, allTags, gameDate, initialData, isContentValid, isSubmitting, onFormStateChange]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isSubmitting && isContentValid) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, isSubmitting, isContentValid]);

  const handleSubmit = async () => {
    if (!isContentValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content, allTags, gameDate || undefined);

      // Clear form (keep tags for quick note-taking)
      if (!isEditMode) {
        setContent("");
        setGameDate("");
      }
      setHasUnsavedChanges(false);

      toast({
        title: isEditMode ? "Thought updated" : "Thought recorded",
        description: isEditMode
          ? "Your thought has been updated successfully."
          : "Your thought has been saved successfully. Tags retained for next entry.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save thought. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey && isContentValid) {
      handleSubmit();
    }
  };

  // Keyboard shortcut: Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (isContentValid && !isSubmitting) {
          handleSubmit();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [content, allTags, gameDate, isSubmitting, isContentValid]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">{isEditMode ? "Edit Thought" : "Record a Thought"}</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch id="use-default-tags" checked={useDefaultTags} onCheckedChange={setUseDefaultTags} />
              <Label
                htmlFor="use-default-tags"
                className="text-sm font-medium cursor-pointer flex items-center gap-1.5"
              >
                <Pin className="h-4 w-4" />
                Use Default Tags
              </Label>
            </div>
            {showSettings && onDefaultTagsChange && (
              <Settings
                defaultTags={defaultTags}
                onDefaultTagsChange={onDefaultTagsChange}
                existingEntities={existingEntities}
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="content">What happened in your campaign?</Label>
          <Textarea
            id="content"
            placeholder="Describe the events, encounters, or discoveries..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyPress}
            className="min-h-40 resize-y"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Press Ctrl+Enter to submit</span>
            <span className={content.length > 2000 ? "text-destructive" : ""}>{content.length}/2000</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>
              Tags (Characters, Locations, Items, etc.)
              <span className="text-muted-foreground ml-2">({allTags.length} active)</span>
            </Label>
            {tags.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setTags([])}
                className="h-auto py-1 px-2 gap-1"
              >
                <X className="h-3 w-3" />
                Clear tags
              </Button>
            )}
          </div>
          <TagSelector
            tags={tags}
            onTagsChange={setTags}
            suggestions={suggestions}
            placeholder="Add additional tags..."
            defaultTags={useDefaultTags ? defaultTags : []}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gameDate">Game Date (optional)</Label>
          <Input
            id="gameDate"
            placeholder="e.g., Day 15 of Flamerule, 1492 DR"
            value={gameDate}
            onChange={(e) => setGameDate(e.target.value)}
          />
        </div>

        <div className="pt-4 flex justify-end">
          <Button onClick={handleSubmit} disabled={!isContentValid || isSubmitting} className="min-w-32">
            {isSubmitting ? "Saving..." : isEditMode ? "Update Thought" : "Save Thought"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
