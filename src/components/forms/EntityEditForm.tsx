import { useState, useEffect, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EntityType, LocalEntity, EntityAttribute, DefaultEntityAttribute } from '@/types/entities';
import { ENTITY_TYPE_CONFIGS } from '@/config/entityTypeConfig';
import { capitalize } from '@/utils/formatters';
import { EntityRelationshipSelector } from './EntityRelationshipSelector';
import { AttributeEditor } from './AttributeEditor';
import { entityService } from '@/services/entityService';
import { dataStorageService } from '@/services/dataStorageService';
import { schemaValidationService } from '@/services/schemaValidationService';
import { useToast } from '@/hooks/use-toast';

// Entity types are now centralized in entityTypeConfig.ts
const entityTypes = ENTITY_TYPE_CONFIGS;

interface EntityEditFormProps {
  entity: LocalEntity;
  onSubmit: (
    name: string, 
    type: EntityType, 
    description?: string,
    parentEntities?: string[],
    linkedEntities?: string[],
    attributes?: EntityAttribute[]
  ) => Promise<void>;
  onCancel: () => void;
  onFormStateChange?: (state: {
    name: string;
    isSaveDisabled: boolean;
    hasUnsavedChanges: boolean;
    isSubmitting: boolean;
  }) => void;
}

export const EntityEditForm = forwardRef<HTMLFormElement, EntityEditFormProps>(({ entity, onSubmit, onCancel, onFormStateChange }, ref) => {
  const [name, setName] = useState(entity.name);
  const [type, setType] = useState<EntityType>(entity.type === 'uncategorized' ? 'npc' : entity.type);
  const [description, setDescription] = useState(entity.description || '');
  const [parentEntities, setParentEntities] = useState<string[]>(entity.parentEntities || []);
  const [linkedEntities, setLinkedEntities] = useState<string[]>(entity.linkedEntities || []);
  const [attributes, setAttributes] = useState<EntityAttribute[]>(entity.attributes || []);
  const [defaultAttributes, setDefaultAttributes] = useState<DefaultEntityAttribute[]>([]);
  const [allEntities, setAllEntities] = useState<LocalEntity[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setAllEntities(entityService.getAllEntities());
  }, []);

  // Track unsaved changes and notify parent
  useEffect(() => {
    const nameChanged = name !== entity.name;
    const typeChanged = type !== entity.type;
    const descChanged = description !== (entity.description || '');
    const parentsChanged = JSON.stringify(parentEntities) !== JSON.stringify(entity.parentEntities || []);
    const linkedChanged = JSON.stringify(linkedEntities) !== JSON.stringify(entity.linkedEntities || []);
    const attrsChanged = JSON.stringify(attributes) !== JSON.stringify(entity.attributes || []);
    
    const unsaved = nameChanged || typeChanged || descChanged || parentsChanged || linkedChanged || attrsChanged;
    setHasUnsavedChanges(unsaved);

    onFormStateChange?.({
      name,
      isSaveDisabled: !name.trim(),
      hasUnsavedChanges: unsaved,
      isSubmitting
    });
  }, [name, type, description, parentEntities, linkedEntities, attributes, entity, isSubmitting, onFormStateChange]);

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
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
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
      await onSubmit(
        name.trim(), 
        type, 
        description.trim() || undefined,
        parentEntities,
        linkedEntities,
        attributes
      );
      setHasUnsavedChanges(false);
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
  }, [name, type, description, parentEntities, linkedEntities, attributes, isSubmitting]);

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="entity-name">Name</Label>
        <Input
          id="entity-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter entity name"
          disabled={isSubmitting}
          required
          autoFocus
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
          rows={8}
          className="resize-y"
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

      <AttributeEditor
        attributes={attributes}
        onChange={setAttributes}
        defaultAttributes={defaultAttributes}
        disabled={isSubmitting}
      />
    </form>
  );
});

EntityEditForm.displayName = 'EntityEditForm';