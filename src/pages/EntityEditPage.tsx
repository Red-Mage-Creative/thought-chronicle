import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EntityEditForm } from '@/components/forms/EntityEditForm';
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
  const [entity, setEntity] = useState<LocalEntity | null>(null);
  const [loading, setLoading] = useState(true);

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
    }
  };

  const handleCancel = () => {
    navigateBack();
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
        <CardHeader>
          <CardTitle>Edit Entity</CardTitle>
          <CardDescription>
            Update the details, relationships, and attributes for {entity.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EntityEditForm 
            entity={entity} 
            onSubmit={handleSubmit} 
            onCancel={handleCancel} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EntityEditPage;
