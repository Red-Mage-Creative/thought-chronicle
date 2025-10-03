import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EntityEditForm } from '@/components/forms/EntityEditForm';
import { FormControls } from '@/components/forms/FormControls';
import { entityService } from '@/services/entityService';
import { EntityType, LocalEntity, EntityAttribute } from '@/types/entities';
import { useNavigationState } from '@/hooks/useNavigationState';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const EntityEditPage = () => {
  const { entityName } = useParams<{ entityName: string }>();
  const { navigateBack } = useNavigationState();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [entity, setEntity] = useState<LocalEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    isSaveDisabled: boolean;
  }>({ name: '', isSaveDisabled: false });

  useEffect(() => {
    if (entityName) {
      const decodedName = decodeURIComponent(entityName);
      const foundEntity = entityService.getEntityByName(decodedName);
      setEntity(foundEntity);
      setLoading(false);
    }
  }, [entityName]);

  // Update browser tab title when unsaved changes exist
  useEffect(() => {
    const originalTitle = document.title;
    if (hasUnsavedChanges) {
      document.title = `* ${originalTitle}`;
    } else {
      document.title = originalTitle.replace(/^\* /, '');
    }
    return () => {
      document.title = originalTitle.replace(/^\* /, '');
    };
  }, [hasUnsavedChanges]);

  /**
   * Handle entity update with relationship management
   * 
   * Note: This function works with entity NAMES for the API, but entityService (v1.3.0+)
   * converts these names to IDs internally when storing relationships. This provides
   * a user-friendly interface while maintaining data integrity behind the scenes.
   */
  const handleSubmit = async (
    name: string,
    type: EntityType,
    description?: string,
    parentEntities?: string[],
    linkedEntities?: string[],
    attributes?: EntityAttribute[]
  ) => {
    if (!entity) return;

    setIsSubmitting(true);
    try {
      // Update basic entity fields
      entityService.updateEntity(
        entity.localId || entity.id!,
        { name, type, description, attributes }
      );

      // Handle parent entity changes (names converted to IDs in entityService)
      if (parentEntities !== undefined) {
        const currentParents = entity.parentEntities || [];
        
        // Remove parents that are no longer selected
        currentParents.forEach(parent => {
          if (!parentEntities.includes(parent)) {
            entityService.removeParentEntity(entity.localId || entity.id!, parent);
          }
        });
        
        // Add newly selected parents
        parentEntities.forEach(parent => {
          if (!currentParents.includes(parent)) {
            entityService.addParentEntity(entity.localId || entity.id!, parent);
          }
        });
      }

      // Handle linked entity changes (names converted to IDs in entityService)
      if (linkedEntities !== undefined) {
        const currentLinked = entity.linkedEntities || [];
        
        // Remove links that are no longer selected
        currentLinked.forEach(linked => {
          if (!linkedEntities.includes(linked)) {
            entityService.removeLinkedEntity(entity.localId || entity.id!, linked);
          }
        });
        
        // Add newly selected links
        linkedEntities.forEach(linked => {
          if (!currentLinked.includes(linked)) {
            entityService.addLinkedEntity(entity.localId || entity.id!, linked);
          }
        });
      }

      toast({
        title: 'Success',
        description: `${name} has been updated.`
      });

      navigateBack();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update entity.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigateBack();
  };

  const handleSaveClick = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!entity) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={navigateBack}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Entities
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Entity not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={navigateBack}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Entities
        </Button>

        <FormControls
          onSave={handleSaveClick}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          isSaveDisabled={formData.isSaveDisabled}
          saveLabel="Update Entity"
          hasUnsavedChanges={hasUnsavedChanges}
          variant="compact"
        />
      </div>

      <Card className={hasUnsavedChanges ? 'border-l-4 border-l-amber-500' : ''}>
        <CardHeader>
          <CardTitle>Edit Entity</CardTitle>
          <CardDescription>
            Update the details, relationships, and attributes for {entity.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EntityEditForm
            ref={formRef}
            entity={entity} 
            onSubmit={handleSubmit} 
            onCancel={handleCancel}
            onFormStateChange={(state) => {
              setFormData({ name: state.name, isSaveDisabled: state.isSaveDisabled });
              setHasUnsavedChanges(state.hasUnsavedChanges);
              setIsSubmitting(state.isSubmitting);
            }}
          />
        </CardContent>
      </Card>

      <FormControls
        onSave={handleSaveClick}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        isSaveDisabled={formData.isSaveDisabled}
        saveLabel="Update Entity"
        hasUnsavedChanges={hasUnsavedChanges}
      />
    </div>
  );
};

export default EntityEditPage;
