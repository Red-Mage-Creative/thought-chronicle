import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EntityForm } from '@/components/forms/EntityForm';
import { entityService } from '@/services/entityService';
import { EntityType, EntityAttribute } from '@/types/entities';
import { useNavigationState } from '@/hooks/useNavigationState';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EntityCreatePage = () => {
  const { navigateBack } = useNavigationState();

  const handleSubmit = async (
    name: string,
    type: EntityType,
    description?: string,
    attributes?: EntityAttribute[]
  ) => {
    await entityService.createEntity(name, type, description, 'manual', attributes);
    navigateBack();
  };

  const handleCancel = () => {
    navigateBack();
  };

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
          <CardTitle>Create New Entity</CardTitle>
          <CardDescription>
            Add a new character, location, item, or other entity to your campaign registry.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EntityForm onSubmit={handleSubmit} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  );
};

export default EntityCreatePage;
