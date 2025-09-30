import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
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
  onFormStateChange?: (state: {
    name: string;
    isSaveDisabled: boolean;
    hasUnsavedChanges: boolean;
    isSubmitting: boolean;
  }) => void;
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

export const EntityForm = forwardRef<HTMLFormElement, EntityFormProps>(({ onSubmit, onCancel, onFormStateChange }, ref) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<EntityType>('npc');
  const [description, setDescription] = useState('');
  const [attributes, setAttributes] = useState<EntityAttribute[]>([]);
  const [defaultAttributes, setDefaultAttributes] = useState<DefaultEntityAttribute[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  // Track unsaved changes and notify parent
  useEffect(() => {
    const unsaved = name.trim().length > 0 || description.trim().length > 0;
    setHasUnsavedChanges(unsaved);
    
    onFormStateChange?.({
      name,
      isSaveDisabled: !name.trim(),
      hasUnsavedChanges: unsaved,
      isSubmitting
    });
  }, [name, description, isSubmitting, onFormStateChange]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isSubmitting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isSubmitting]);

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
      setHasUnsavedChanges(false);
      
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

  // Keyboard shortcut: Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (name.trim() && !isSubmitting) {
          handleSubmit(e as any);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [name, type, description, attributes, isSubmitting]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter entity name..."
          disabled={isSubmitting}
          autoFocus
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
          className="min-h-32 resize-y"
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
    </form>
  );
});

EntityForm.displayName = 'EntityForm';