import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { EntityType, EntityAttribute, DefaultEntityAttribute } from '@/types/entities';
import { UserCheck, Users, Footprints, Church, ScrollText, Skull, MapPin, Shield, Package } from 'lucide-react';
import { AttributeEditor } from './AttributeEditor';
import { dataStorageService } from '@/services/dataStorageService';
import { schemaValidationService } from '@/services/schemaValidationService';

interface EntityFormProps {
  onSubmit: (name: string, type: EntityType, description?: string, attributes?: EntityAttribute[]) => Promise<void>;
  onCancel: () => void;
}

const entityTypes = [
  { value: 'pc' as const, label: 'Player Character', icon: UserCheck },
  { value: 'npc' as const, label: 'NPC', icon: Users },
  { value: 'race' as const, label: 'Race', icon: Footprints },
  { value: 'religion' as const, label: 'Religion', icon: Church },
  { value: 'quest' as const, label: 'Quest', icon: ScrollText },
  { value: 'enemy' as const, label: 'Enemy', icon: Skull },
  { value: 'location' as const, label: 'Location', icon: MapPin },
  { value: 'organization' as const, label: 'Organization', icon: Shield },
  { value: 'item' as const, label: 'Item', icon: Package }
];

export const EntityForm = ({ onSubmit, onCancel }: EntityFormProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<EntityType>('npc');
  const [description, setDescription] = useState('');
  const [attributes, setAttributes] = useState<EntityAttribute[]>([]);
  const [defaultAttributes, setDefaultAttributes] = useState<DefaultEntityAttribute[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Load default attributes when type changes
  useEffect(() => {
    const defaults = dataStorageService.getDefaultAttributesForEntityType(type);
    setDefaultAttributes(defaults);
    
    // Pre-populate attributes with defaults that have default values
    const initialAttributes: EntityAttribute[] = defaults
      .filter(attr => attr.defaultValue)
      .map(attr => ({ key: attr.key, value: attr.defaultValue! }));
    
    setAttributes(initialAttributes);
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Entity name is required.',
        variant: 'destructive'
      });
      return;
    }

    // Validate required attributes
    const validation = schemaValidationService.validateRequiredAttributes(
      { name, type, attributes } as any,
      defaultAttributes
    );

    if (!validation.valid) {
      toast({
        title: 'Missing Required Attributes',
        description: `Please fill in: ${validation.missingFields.join(', ')}`,
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(name.trim(), type, description.trim() || undefined, attributes);
      
      // Reset form
      setName('');
      setType('npc');
      setDescription('');
      setAttributes([]);
      
      toast({
        title: 'Success',
        description: `${name} has been added to your registry.`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create entity.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter entity name..."
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select value={type} onValueChange={(value) => setType(value as EntityType)} disabled={isSubmitting}>
          <SelectTrigger>
            <SelectValue />
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
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add notes about this entity..."
          className="min-h-20 resize-none"
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground">
          Supports markdown: **bold**, *italic*, [links](url), lists, and more
        </p>
      </div>

      <AttributeEditor
        attributes={attributes}
        onChange={setAttributes}
        defaultAttributes={defaultAttributes}
        disabled={isSubmitting}
      />

      <div className="flex gap-2">
        <Button type="submit" disabled={!name.trim() || isSubmitting} className="flex-1">
          {isSubmitting ? 'Creating...' : 'Create Entity'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
};