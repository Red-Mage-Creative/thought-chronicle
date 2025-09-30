import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ThoughtForm } from '@/components/forms/ThoughtForm';
import { FormControls } from '@/components/forms/FormControls';
import { thoughtService } from '@/services/thoughtService';
import { useEntities } from '@/hooks/useEntities';
import { useThoughts } from '@/hooks/useThoughts';
import { useEntitySuggestions } from '@/hooks/useEntitySuggestions';
import { useNavigationState } from '@/hooks/useNavigationState';
import { LocalThought } from '@/types/thoughts';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ThoughtEditPage = () => {
  const { thoughtId } = useParams<{ thoughtId: string }>();
  const { navigateBack } = useNavigationState();
  const { entities } = useEntities();
  const { thoughts } = useThoughts();
  const suggestions = useEntitySuggestions(entities, thoughts);
  const [thought, setThought] = useState<LocalThought | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);
  const [handleSubmitRef, setHandleSubmitRef] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (thoughtId) {
      const allThoughts = thoughtService.getAllThoughts();
      const foundThought = allThoughts.find(
        t => t.id === thoughtId || t.localId === thoughtId
      );
      setThought(foundThought || null);
      setLoading(false);
    }
  }, [thoughtId]);

  const handleSubmit = async (content: string, tags: string[], gameDate?: string) => {
    if (!thought) return;
    
    setIsSubmitting(true);
    try {
      const thoughtIdToUpdate = thought.id || thought.localId;
      if (thoughtIdToUpdate) {
        thoughtService.updateThought(thoughtIdToUpdate, content, tags, gameDate);
        navigateBack();
      }
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!thought) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={navigateBack}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to History
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Thought not found.</p>
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
          Back to History
        </Button>

        <FormControls
          onSave={handleSaveClick}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          isSaveDisabled={isSaveDisabled}
          saveLabel="Update Thought"
          hasUnsavedChanges={hasUnsavedChanges}
          variant="compact"
        />
      </div>

      <ThoughtForm
        onSubmit={handleSubmit}
        suggestions={suggestions}
        initialData={{
          content: thought.content,
          relatedEntities: thought.relatedEntities,
          gameDate: thought.gameDate
        }}
        isEditMode={true}
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
            saveLabel="Update Thought"
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </div>
      </div>
    </div>
  );
};

export default ThoughtEditPage;
