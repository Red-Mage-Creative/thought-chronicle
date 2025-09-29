import { useState } from "react";
import { Settings as SettingsIcon, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TagSelector } from "@/components/forms/TagSelector";
import { Badge } from "@/components/ui/badge";
import { EntitySuggestion } from '@/types/entities';
import { getEntityClass } from '@/utils/entityUtils';

interface SettingsProps {
  defaultTags: string[];
  onDefaultTagsChange: (tags: string[]) => void;
  existingEntities: EntitySuggestion[];
}

export const Settings = ({ defaultTags, onDefaultTagsChange, existingEntities }: SettingsProps) => {
  const [localDefaultTags, setLocalDefaultTags] = useState<string[]>(defaultTags);
  const [isOpen, setIsOpen] = useState(false);


  const handleSave = () => {
    onDefaultTagsChange(localDefaultTags);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setLocalDefaultTags(defaultTags);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SettingsIcon className="h-4 w-4" />
          Settings
          {defaultTags.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {defaultTags.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chronicle Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Default Tags</h3>
              <p className="text-sm text-muted-foreground mb-4">
                These tags will be automatically added to every new thought you record. 
                Perfect for tracking your player character, campaign, or session details.
              </p>
              
              <div className="space-y-3">
                <TagSelector
                  tags={localDefaultTags}
                  onTagsChange={setLocalDefaultTags}
                  suggestions={existingEntities}
                  placeholder="Add default tags (e.g., player-thara, campaign-waterdeep)..."
                />
                
                {localDefaultTags.length > 0 && (
                  <div className="p-3 bg-muted/30 border border-border rounded">
                    <div className="text-sm text-muted-foreground mb-2">Preview - these tags will be added to every thought:</div>
                    <div className="flex flex-wrap gap-2">
                      {localDefaultTags.map(tag => (
                        <Badge 
                          key={tag} 
                          variant="outline" 
                          className={`entity-tag ${getEntityClass(tag)} text-xs`}
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {defaultTags.length > 0 && (
              <div className="border-t border-border pt-4">
                <div className="text-sm text-muted-foreground">
                  <strong>Current active default tags:</strong>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {defaultTags.map(tag => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className={`entity-tag ${getEntityClass(tag)} text-xs`}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};