import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ThoughtForm } from '@/components/forms/ThoughtForm';
import { FormControls } from '@/components/forms/FormControls';
import { thoughtService } from '@/services/thoughtService';
import { entityService } from '@/services/entityService';
import { useEntities } from '@/hooks/useEntities';
import { useThoughts } from '@/hooks/useThoughts';
import { useEntitySuggestions } from '@/hooks/useEntitySuggestions';
import { useNavigationState } from '@/hooks/useNavigationState';
import { LocalThought } from '@/types/thoughts';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const ThoughtEditPage = () => {
  const { thoughtId } = useParams<{ thoughtId: string }>();
  const { navigateBack } = useNavigationState();
  const { entities, refreshEntities } = useEntities();
  const { thoughts } = useThoughts();
  const suggestions = useEntitySuggestions(entities, thoughts);
  const { toast } = useToast();
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
        // Get existing entities before update to identify new ones
        const existingEntities = entityService.getAllEntities();
        const existingNames = existingEntities.map(e => e.name.toLowerCase());
        
        // Identify new entity tags
        const newEntityNames = tags.filter(tag => 
          !existingNames.includes(tag.toLowerCase())
        );
        
        // Update thought (will auto-create missing entities)
        thoughtService.updateThought(thoughtIdToUpdate, content, tags, gameDate);
        
        // Show notification if new entities were created
        if (newEntityNames.length > 0) {
          toast({
            title: 'Entities created',
            description: `Created ${newEntityNames.length} new ${newEntityNames.length === 1 ? 'entity' : 'entities'}: ${newEntityNames.join(', ')}`
          });
          
          // Refresh entities to show new ones in the UI
          refreshEntities();
        }
        
        navigateBack();
      }
    } catch (error) {
      console.error('Error updating thought:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update thought',
        variant: 'destructive'
      });
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
    <div className="space-y-6 pb-8">
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

      <FormControls
        onSave={handleSaveClick}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        isSaveDisabled={isSaveDisabled}
        saveLabel="Update Thought"
        hasUnsavedChanges={hasUnsavedChanges}
      />
    </div>
  );
};

export default ThoughtEditPage;
