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

      // Handle parent entity changes
      if (parentEntities !== undefined) {
        const currentParents = entity.parentEntities || [];
        
        currentParents.forEach(parent => {
          if (!parentEntities.includes(parent)) {
            entityService.removeParentEntity(entity.localId || entity.id!, parent);
          }
        });
        
        parentEntities.forEach(parent => {
          if (!currentParents.includes(parent)) {
            entityService.addParentEntity(entity.localId || entity.id!, parent);
          }
        });
      }

      // Handle linked entity changes
      if (linkedEntities !== undefined) {
        const currentLinked = entity.linkedEntities || [];
        
        currentLinked.forEach(linked => {
          if (!linkedEntities.includes(linked)) {
            entityService.removeLinkedEntity(entity.localId || entity.id!, linked);
          }
        });
        
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
    <div className="space-y-6 pb-32">
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

      <Card>
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

      {/* Sticky Bottom Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <FormControls
            onSave={handleSaveClick}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            isSaveDisabled={formData.isSaveDisabled}
            saveLabel="Update Entity"
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </div>
      </div>
    </div>
  );
};

export default EntityEditPage;
