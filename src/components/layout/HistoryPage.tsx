import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { ThoughtList } from '@/components/display/ThoughtList';
import { ThoughtForm } from '@/components/forms/ThoughtForm';
import { useThoughts } from '@/hooks/useThoughts';
import { useEntities } from '@/hooks/useEntities';
import { LocalThought } from '@/types/thoughts';
import { Search, RefreshCw, Plus } from 'lucide-react';
import { syncService } from '@/services/syncService';
import { useToast } from '@/hooks/use-toast';

interface HistoryPageProps {
  onEntityClick?: (entityName: string) => void;
}

export const HistoryPage = ({ onEntityClick }: HistoryPageProps) => {
  const { thoughts, createThought, updateThought, deleteThought, refreshThoughts, isLoading } = useThoughts();
  const { getSuggestions } = useEntities();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingThought, setEditingThought] = useState<LocalThought | null>(null);
  const [deletingThoughtId, setDeletingThoughtId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await syncService.refreshFromServer();
      refreshThoughts();
      toast({
        title: 'Data refreshed',
        description: 'Successfully synchronized with server.'
      });
    } catch (error) {
      console.error('Refresh failed:', error);
      toast({
        title: 'Refresh failed',
        description: 'Could not sync with server. Check your connection.',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleThoughtCreate = async (content: string, tags: string[], gameDate?: string) => {
    await createThought(content, tags, gameDate);
    setIsAddModalOpen(false);
  };

  const handleThoughtEdit = async (content: string, tags: string[], gameDate?: string) => {
    if (!editingThought) return;
    await updateThought(editingThought.localId || editingThought.id!, content, tags, gameDate);
    setEditingThought(null);
  };

  const handleThoughtDelete = async () => {
    if (!deletingThoughtId) return;
    await deleteThought(deletingThoughtId);
    setDeletingThoughtId(null);
    toast({
      title: 'Thought deleted',
      description: 'The thought has been removed from your campaign history.'
    });
  };

  const filteredThoughts = thoughts.filter(thought => {
    const matchesSearch = thought.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntity = !selectedEntity || 
      thought.relatedEntities.some(entity => 
        entity.toLowerCase() === selectedEntity.toLowerCase()
      );
    return matchesSearch && matchesEntity;
  });

  // Get unique entities mentioned in thoughts
  const mentionedEntities = Array.from(
    new Set(thoughts.flatMap(t => t.relatedEntities))
  ).sort();

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">Campaign History</CardTitle>
          <div className="flex gap-2">
            <Button onClick={() => setIsAddModalOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Thought
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search thoughts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {mentionedEntities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedEntity === '' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedEntity('')}
            >
              All
            </Badge>
            {mentionedEntities.map((entity) => (
              <Badge
                key={entity}
                variant={selectedEntity === entity ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedEntity(entity)}
              >
                {entity}
              </Badge>
            ))}
          </div>
        )}

        <ThoughtList 
          thoughts={filteredThoughts} 
          onEntityClick={onEntityClick}
          onEditThought={setEditingThought}
          onDeleteThought={setDeletingThoughtId}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>

    {/* Add Thought Modal */}
    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record New Thought</DialogTitle>
        </DialogHeader>
        <ThoughtForm
          onSubmit={handleThoughtCreate}
          suggestions={getSuggestions()}
        />
      </DialogContent>
    </Dialog>

    {/* Edit Thought Modal */}
    <Dialog open={!!editingThought} onOpenChange={() => setEditingThought(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Thought</DialogTitle>
        </DialogHeader>
        {editingThought && (
          <ThoughtForm
            onSubmit={handleThoughtEdit}
            suggestions={getSuggestions()}
            initialData={{
              content: editingThought.content,
              relatedEntities: editingThought.relatedEntities,
              gameDate: editingThought.gameDate
            }}
            isEditMode={true}
          />
        )}
      </DialogContent>
    </Dialog>

    {/* Delete Confirmation Dialog */}
    <ConfirmationDialog
      open={!!deletingThoughtId}
      onOpenChange={() => setDeletingThoughtId(null)}
      title="Delete Thought"
      description="Are you sure you want to delete this thought? This action cannot be undone."
      confirmText="Delete"
      variant="destructive"
      onConfirm={handleThoughtDelete}
    />
    </>
  );
};