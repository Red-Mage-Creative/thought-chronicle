import { useState } from 'react';
import { ThoughtForm } from '@/components/forms/ThoughtForm';
import { FormControls } from '@/components/forms/FormControls';
import { thoughtService } from '@/services/thoughtService';
import { useEntities } from '@/hooks/useEntities';
import { useThoughts } from '@/hooks/useThoughts';
import { useEntitySuggestions } from '@/hooks/useEntitySuggestions';
import { useNavigationState } from '@/hooks/useNavigationState';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ThoughtCreatePage = () => {
  const { navigateBack } = useNavigationState();
  const { entities } = useEntities();
  const { thoughts } = useThoughts();
  const suggestions = useEntitySuggestions(entities, thoughts);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [handleSubmitRef, setHandleSubmitRef] = useState<(() => void) | null>(null);

  const handleSubmit = async (content: string, tags: string[], gameDate?: string) => {
    setIsSubmitting(true);
    try {
      thoughtService.createThought(content, tags, gameDate);
      navigateBack();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveClick = () => {
    handleSubmitRef?.();
  };

  const handleCancel = () => {
    navigateBack();
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
          Back to History
        </Button>

        <FormControls
          onSave={handleSaveClick}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          isSaveDisabled={isSaveDisabled}
          saveLabel="Record Thought"
          hasUnsavedChanges={hasUnsavedChanges}
          variant="compact"
        />
      </div>

      <ThoughtForm
        onSubmit={handleSubmit}
        suggestions={suggestions}
        onFormStateChange={(state) => {
          setIsSaveDisabled(state.isSaveDisabled);
          setHasUnsavedChanges(state.hasUnsavedChanges);
          setIsSubmitting(state.isSubmitting);
          setHandleSubmitRef(() => state.handleSubmit);
        }}
      />

      {/* Sticky Bottom Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <FormControls
            onSave={handleSaveClick}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            isSaveDisabled={isSaveDisabled}
            saveLabel="Record Thought"
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </div>
      </div>
    </div>
  );
};

export default ThoughtCreatePage;
