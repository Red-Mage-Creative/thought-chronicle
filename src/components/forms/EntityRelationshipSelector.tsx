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

interface EntityRelationshipSelectorProps {
  label: string;
  selectedEntities: string[];
  availableEntities: LocalEntity[];
  excludeIds?: string[];
  onAdd: (entityName: string) => void;
  onRemove: (entityName: string) => void;
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

      {/* Add entity selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
            disabled={disabled || filteredEntities.length === 0}
          >
            {filteredEntities.length === 0 ? 'No entities available' : `Add ${label.toLowerCase()}...`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search entities...`} />
            <CommandList>
              <CommandEmpty>No entities found.</CommandEmpty>
              <CommandGroup>
                {filteredEntities.map((entity) => {
                  const Icon = getEntityIcon(entity.type);
                  return (
                    <CommandItem
                      key={entity.name}
                      value={entity.name}
                      onSelect={() => handleSelect(entity.name)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      <span>{entity.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {capitalize(entity.type)}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
