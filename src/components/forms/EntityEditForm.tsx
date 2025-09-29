import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EntityType, LocalEntity } from '@/types/entities';
import { getEntityIcon } from '@/utils/entityUtils';
import { capitalize } from '@/utils/formatters';

const entityTypes = [
  { value: 'character', label: 'Character', icon: getEntityIcon('character') },
  { value: 'location', label: 'Location', icon: getEntityIcon('location') },
  { value: 'organization', label: 'Organization', icon: getEntityIcon('organization') },
  { value: 'item', label: 'Item', icon: getEntityIcon('item') },
] as const;

interface EntityEditFormProps {
  entity: LocalEntity;
  onSubmit: (name: string, type: EntityType, description?: string) => Promise<void>;
  onCancel: () => void;
}

export const EntityEditForm = ({ entity, onSubmit, onCancel }: EntityEditFormProps) => {
  const [name, setName] = useState(entity.name);
  const [type, setType] = useState<EntityType>(entity.type === 'uncategorized' ? 'character' : entity.type);
  const [description, setDescription] = useState(entity.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(name.trim(), type, description.trim() || undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      </div>

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