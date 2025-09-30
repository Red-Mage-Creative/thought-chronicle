import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ThoughtForm } from '@/components/forms/ThoughtForm';
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
    
    const thoughtIdToUpdate = thought.id || thought.localId;
    if (thoughtIdToUpdate) {
      thoughtService.updateThought(thoughtIdToUpdate, content, tags, gameDate);
      navigateBack();
    }
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

      <ThoughtForm
        onSubmit={handleSubmit}
        suggestions={suggestions}
        initialData={{
          content: thought.content,
          relatedEntities: thought.relatedEntities,
          gameDate: thought.gameDate
        }}
        isEditMode={true}
      />
    </div>
  );
};

export default ThoughtEditPage;
