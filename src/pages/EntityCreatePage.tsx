import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EntityForm } from '@/components/forms/EntityForm';
import { FormControls } from '@/components/forms/FormControls';
import { entityService } from '@/services/entityService';
import { EntityType, EntityAttribute } from '@/types/entities';
import { useNavigationState } from '@/hooks/useNavigationState';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EntityCreatePage = () => {
  const { navigateBack } = useNavigationState();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    isSaveDisabled: boolean;
  }>({ name: '', isSaveDisabled: true });

  const handleSubmit = async (
    name: string,
    type: EntityType,
    description?: string,
    attributes?: EntityAttribute[]
  ) => {
    setIsSubmitting(true);
    try {
      await entityService.createEntity(name, type, description, 'manual', attributes);
      navigateBack();
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
          saveLabel="Create Entity"
          hasUnsavedChanges={hasUnsavedChanges}
          variant="compact"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Entity</CardTitle>
          <CardDescription>
            Add a new character, location, item, or other entity to your campaign registry.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EntityForm 
            ref={formRef}
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
            saveLabel="Create Entity"
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </div>
      </div>
    </div>
  );
};

export default EntityCreatePage;
