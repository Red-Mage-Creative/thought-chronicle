import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { ThoughtList } from '@/components/display/ThoughtList';
import { useThoughts } from '@/hooks/useThoughts';
import { useEntities } from '@/hooks/useEntities';
import { useNavigationState } from '@/hooks/useNavigationState';
import { Search, RefreshCw, Plus, Calendar } from 'lucide-react';
import { syncService } from '@/services/syncService';
import { useToast } from '@/hooks/use-toast';
import { subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface HistoryPageProps {
  onEntityClick?: (entityName: string) => void;
}

export const HistoryPage = ({ onEntityClick }: HistoryPageProps) => {
  const { navigateWithContext, restoreContext } = useNavigationState();
  const { thoughts, deleteThought, refreshThoughts, isLoading } = useThoughts();
  const { entities } = useEntities();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingThoughtId, setDeletingThoughtId] = useState<string | null>(null);
  const { toast } = useToast();

  // Restore context when returning from edit/create page
  useEffect(() => {
    const restored = restoreContext('/history');
    if (restored) {
      if (restored.searchTerm) setSearchTerm(restored.searchTerm);
      if (restored.selectedDateFilter) setSelectedDateFilter(restored.selectedDateFilter);
      
      // Restore scroll position
      if (restored.scrollY) {
        setTimeout(() => window.scrollTo(0, restored.scrollY), 0);
      }
    }
  }, []);

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

  const handleAddThought = () => {
    navigateWithContext('/thoughts/new', {
      searchTerm,
      selectedDateFilter,
      scrollY: window.scrollY
    });
  };

  const handleEditThought = (thoughtId: string) => {
    navigateWithContext(`/thoughts/${thoughtId}/edit`, {
      searchTerm,
      selectedDateFilter,
      scrollY: window.scrollY
    });
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

  // Helper to validate Date
  const isValidDate = (d: unknown): d is Date =>
    d instanceof Date && !Number.isNaN(d.getTime());

  // Map selected filter to a date range
  const getDateRange = (filter: string): { start: Date; end: Date } | null => {
    const now = new Date();

    switch (filter) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'yesterday': {
        const yesterday = subDays(now, 1);
        return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
      }
      case 'last7':
        // inclusive: today + previous 6 days
        return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
      case 'thisWeek':
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 }),
        };
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'all':
      default:
        return null;
    }
  };

  const filteredThoughts = thoughts.filter((thought) => {
    const contentMatch = thought.content
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const range = getDateRange(selectedDateFilter);
    if (!range) return contentMatch;

    // Safely coerce and validate the timestamp
    const ts = isValidDate(thought.timestamp)
      ? thought.timestamp
      : new Date(thought.timestamp as any);

    if (!isValidDate(ts)) return false;

    return contentMatch && ts >= range.start && ts <= range.end;
  });

  // Define date filter options
  const dateFilterOptions = [
    { key: 'all', label: 'All Time' },
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'last7', label: 'Last 7 Days' },
    { key: 'thisWeek', label: 'This Week' },
    { key: 'thisMonth', label: 'This Month' }
  ];

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">Campaign History</CardTitle>
          <div className="flex gap-2">
            <Button onClick={handleAddThought} size="sm">
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

        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter by date written:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {dateFilterOptions.map((option) => (
            <Badge
              key={option.key}
              variant={selectedDateFilter === option.key ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedDateFilter(option.key)}
            >
              {option.label}
            </Badge>
          ))}
        </div>

        <ThoughtList 
          thoughts={filteredThoughts}
          entities={entities}
          onEntityClick={onEntityClick}
          onEditThought={handleEditThought}
          onDeleteThought={setDeletingThoughtId}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>

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