import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EntityType, LocalEntity } from '@/types/entities';
import { getEntityIcon } from '@/utils/entityUtils';
import { capitalize } from '@/utils/formatters';
import { EntityRelationshipSelector } from './EntityRelationshipSelector';
import { entityService } from '@/services/entityService';

const entityTypes = [
  { value: 'pc' as const, label: 'Player Character', icon: getEntityIcon('pc') },
  { value: 'npc' as const, label: 'NPC', icon: getEntityIcon('npc') },
  { value: 'race' as const, label: 'Race', icon: getEntityIcon('race') },
  { value: 'religion' as const, label: 'Religion', icon: getEntityIcon('religion') },
  { value: 'quest' as const, label: 'Quest', icon: getEntityIcon('quest') },
  { value: 'enemy' as const, label: 'Enemy', icon: getEntityIcon('enemy') },
  { value: 'location' as const, label: 'Location', icon: getEntityIcon('location') },
  { value: 'organization' as const, label: 'Organization', icon: getEntityIcon('organization') },
  { value: 'item' as const, label: 'Item', icon: getEntityIcon('item') },
] as const;

interface EntityEditFormProps {
  entity: LocalEntity;
  onSubmit: (
    name: string, 
    type: EntityType, 
    description?: string,
    parentEntities?: string[],
    linkedEntities?: string[]
  ) => Promise<void>;
  onCancel: () => void;
}

export const EntityEditForm = ({ entity, onSubmit, onCancel }: EntityEditFormProps) => {
  const [name, setName] = useState(entity.name);
  const [type, setType] = useState<EntityType>(entity.type === 'uncategorized' ? 'npc' : entity.type);
  const [description, setDescription] = useState(entity.description || '');
  const [parentEntities, setParentEntities] = useState<string[]>(entity.parentEntities || []);
  const [linkedEntities, setLinkedEntities] = useState<string[]>(entity.linkedEntities || []);
  const [allEntities, setAllEntities] = useState<LocalEntity[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setAllEntities(entityService.getAllEntities());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(
        name.trim(), 
        type, 
        description.trim() || undefined,
        parentEntities,
        linkedEntities
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get child entities to prevent circular references
  const getChildEntityNames = (entityName: string, visited = new Set<string>()): string[] => {
    if (visited.has(entityName)) return [];
    visited.add(entityName);
    
    const children = entityService.getChildEntities(entityName);
    let allDescendants = children.map(c => c.name);
    
    children.forEach(child => {
      allDescendants = [...allDescendants, ...getChildEntityNames(child.name, visited)];
    });
    
    return allDescendants;
  };

  const childEntityNames = getChildEntityNames(entity.name);
  const excludeFromParents = [entity.name, ...childEntityNames];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="entity-name">Name</Label>
        <Input
          id="entity-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter entity name"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="entity-type">Type</Label>
        <Select value={type} onValueChange={(value) => setType(value as EntityType)} disabled={isSubmitting}>
          <SelectTrigger id="entity-type">
            <SelectValue placeholder="Select entity type" />
          </SelectTrigger>
          <SelectContent>
            {entityTypes.map((entityType) => {
              const Icon = entityType.icon;
              return (
                <SelectItem key={entityType.value} value={entityType.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {entityType.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="entity-description">Description (optional)</Label>
        <Textarea
          id="entity-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter entity description"
          disabled={isSubmitting}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Supports markdown: **bold**, *italic*, [links](url), lists, and more
        </p>
      </div>

      <EntityRelationshipSelector
        label="Parent Entities"
        selectedEntities={parentEntities}
        availableEntities={allEntities}
        excludeIds={excludeFromParents}
        onAdd={(entityName) => setParentEntities([...parentEntities, entityName])}
        onRemove={(entityName) => setParentEntities(parentEntities.filter(e => e !== entityName))}
        disabled={isSubmitting}
      />

      <EntityRelationshipSelector
        label="Linked Entities"
        selectedEntities={linkedEntities}
        availableEntities={allEntities}
        excludeIds={[entity.name]}
        onAdd={(entityName) => setLinkedEntities([...linkedEntities, entityName])}
        onRemove={(entityName) => setLinkedEntities(linkedEntities.filter(e => e !== entityName))}
        disabled={isSubmitting}
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim() || isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Entity'}
        </Button>
      </div>
    </form>
  );
};