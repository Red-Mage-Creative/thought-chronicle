import { useState } from 'react';
import { X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LocalEntity } from '@/types/entities';
import { getEntityIcon } from '@/utils/entityUtils';
import { capitalize } from '@/utils/formatters';
import { TagSelector } from './TagSelector';
import { entityService } from '@/services/entityService';
import { useToast } from '@/hooks/use-toast';

/**
 * EntityRelationshipSelector - Select parent/linked entities for an entity
 * 
 * Note: This component works with entity NAMES for display and API, but the underlying
 * entityService (v1.3.0+) stores relationships as IDs internally. The conversion
 * from names to IDs happens automatically in entityService methods like
 * addParentEntity() and addLinkedEntity().
 */
interface EntityRelationshipSelectorProps {
  label: string;
  selectedEntities: string[];  // Array of entity names (display format)
  availableEntities: LocalEntity[];
  excludeIds?: string[];  // Entity names to exclude from selection
  onAdd: (entityName: string) => void;  // Called with entity name
  onRemove: (entityName: string) => void;  // Called with entity name
  disabled?: boolean;
}

export const EntityRelationshipSelector = ({
  label,
  selectedEntities,
  availableEntities,
  excludeIds = [],
  onAdd,
  onRemove,
  disabled = false,
}: EntityRelationshipSelectorProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateEntity = async (name: string) => {
    try {
      // Create entity with inferred type as "uncategorized"
      await entityService.createEntity(name, 'uncategorized', '', 'manual');
      toast({
        title: 'Entity Created',
        description: `"${name}" has been added to your registry. You can edit it later to set the type and details.`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create entity.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const filteredEntities = availableEntities.filter(
    (entity) => 
      !selectedEntities.includes(entity.name) && 
      !excludeIds.includes(entity.name)
  );

  const handleSelect = (entityName: string) => {
    onAdd(entityName);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {/* Selected entities */}
      {selectedEntities.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedEntities.map((entityName) => {
            const entity = availableEntities.find(e => e.name === entityName);
            const Icon = entity ? getEntityIcon(entity.type) : null;
            
            return (
              <Badge key={entityName} variant="secondary" className="gap-1 pr-1">
                {Icon && <Icon className="h-3 w-3" />}
                {entityName}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 hover:bg-destructive/20"
                  onClick={() => onRemove(entityName)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Add entity selector with create option */}
      <TagSelector
        tags={selectedEntities}
        onTagsChange={(newTags) => {
          // Handle additions
          const added = newTags.filter(t => !selectedEntities.includes(t));
          added.forEach(entityName => onAdd(entityName));
          
          // Handle removals
          const removed = selectedEntities.filter(t => !newTags.includes(t));
          removed.forEach(entityName => onRemove(entityName));
        }}
        suggestions={filteredEntities.map(e => ({ name: e.name, type: e.type }))}
        placeholder={label}
        onCreateEntity={handleCreateEntity}
      />
    </div>
  );
};
