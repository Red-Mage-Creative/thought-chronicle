import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { LocalEntity } from '@/types/entities';
import { entityService } from '@/services/entityService';
import { thoughtService } from '@/services/thoughtService';

type CascadeMode = 'orphan' | 'block' | 'remove';

interface EntityDeleteDialogProps {
  entity: LocalEntity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (cascadeMode: CascadeMode) => void;
}

export const EntityDeleteDialog = ({
  entity,
  open,
  onOpenChange,
  onConfirm,
}: EntityDeleteDialogProps) => {
  const [cascadeMode, setCascadeMode] = useState<CascadeMode>('orphan');
  
  // Count references
  const relatedThoughts = thoughtService.getThoughtsByEntity(entity.name);
  const childEntities = entityService.getChildEntities(entity.name);
  const linkedEntities = entityService.getLinkedEntities(entity.name);
  
  const thoughtCount = relatedThoughts.length;
  const childCount = childEntities.length;
  const linkedCount = linkedEntities.length;
  const totalReferences = thoughtCount + childCount + linkedCount;

  const handleConfirm = () => {
    onConfirm(cascadeMode);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>Delete "{entity.name}"?</DialogTitle>
          </div>
          <DialogDescription className="text-left pt-2">
            {totalReferences > 0 ? (
              <>
                This entity is referenced in <strong>{totalReferences} location{totalReferences !== 1 ? 's' : ''}</strong>:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {thoughtCount > 0 && <li>{thoughtCount} thought{thoughtCount !== 1 ? 's' : ''}</li>}
                  {childCount > 0 && <li>{childCount} child entit{childCount !== 1 ? 'ies' : 'y'}</li>}
                  {linkedCount > 0 && <li>{linkedCount} linked entit{linkedCount !== 1 ? 'ies' : 'y'}</li>}
                </ul>
                <p className="mt-3">Choose how to handle these references:</p>
              </>
            ) : (
              <p>This entity has no references. It can be safely deleted.</p>
            )}
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={cascadeMode} onValueChange={(value) => setCascadeMode(value as CascadeMode)} className="space-y-4 py-4">
          <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/50 transition-colors">
            <RadioGroupItem value="orphan" id="orphan" />
            <div className="flex-1">
              <Label htmlFor="orphan" className="font-semibold cursor-pointer">
                Leave references as-is (Orphan)
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Delete the entity but keep references. They'll be marked as "orphaned" in the UI.
                <span className="block mt-1 text-xs italic">Recommended for most cases - you can restore references later.</span>
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/50 transition-colors">
            <RadioGroupItem value="block" id="block" />
            <div className="flex-1">
              <Label htmlFor="block" className="font-semibold cursor-pointer">
                Block deletion
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Prevent deletion if any references exist. You'll need to remove references manually first.
                <span className="block mt-1 text-xs italic">Use when you want to ensure no broken references.</span>
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/50 transition-colors border-destructive/30">
            <RadioGroupItem value="remove" id="remove" />
            <div className="flex-1">
              <Label htmlFor="remove" className="font-semibold cursor-pointer text-destructive">
                Remove all references (Destructive)
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Delete the entity AND remove it from all thoughts and other entities.
                <span className="block mt-1 text-xs font-semibold text-destructive">⚠️ This will mark all affected items for sync and cannot be easily undone.</span>
              </p>
            </div>
          </div>
        </RadioGroup>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleConfirm}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete {cascadeMode === 'block' ? '(if no refs)' : 'Entity'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
