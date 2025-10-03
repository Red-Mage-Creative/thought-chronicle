import { useState } from 'react';
import { EntityForm } from '@/components/forms/EntityForm';
import { FormControls } from '@/components/forms/FormControls';
import { entityService } from '@/services/entityService';
import { EntityType, EntityAttribute } from '@/types/entities';
import { useNavigationState } from '@/hooks/useNavigationState';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EntityCreatePage = () => {
  const { navigateBack } = useNavigationState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    isSaveDisabled: boolean;
  }>({ name: '', isSaveDisabled: true });
  const [submitTrigger, setSubmitTrigger] = useState(0);

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
    setSubmitTrigger(prev => prev + 1);
  };

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
          saveLabel="Create Entity"
          hasUnsavedChanges={hasUnsavedChanges}
          variant="compact"
        />
      </div>

      <EntityForm 
        onSubmit={handleSubmit} 
        onCancel={handleCancel}
        submitTrigger={submitTrigger}
        onFormStateChange={(state) => {
          setFormData({ name: state.name, isSaveDisabled: state.isSaveDisabled });
          setHasUnsavedChanges(state.hasUnsavedChanges);
          setIsSubmitting(state.isSubmitting);
        }}
      />

      <FormControls
        onSave={handleSaveClick}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        isSaveDisabled={formData.isSaveDisabled}
        saveLabel="Create Entity"
        hasUnsavedChanges={hasUnsavedChanges}
      />
    </div>
  );
};

export default EntityCreatePage;
