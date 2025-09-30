import { ThoughtForm } from '@/components/forms/ThoughtForm';
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

  const handleSubmit = async (content: string, tags: string[], gameDate?: string) => {
    thoughtService.createThought(content, tags, gameDate);
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
        Back to History
      </Button>

      <ThoughtForm
        onSubmit={handleSubmit}
        suggestions={suggestions}
      />
    </div>
  );
};

export default ThoughtCreatePage;
