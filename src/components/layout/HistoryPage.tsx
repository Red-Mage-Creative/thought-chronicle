import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThoughtList } from '@/components/display/ThoughtList';
import { useThoughts } from '@/hooks/useThoughts';
import { useEntities } from '@/hooks/useEntities';
import { Search, RefreshCw } from 'lucide-react';
import { syncService } from '@/services/syncService';
import { useToast } from '@/hooks/use-toast';

interface HistoryPageProps {
  onEntityClick?: (entityName: string) => void;
}

export const HistoryPage = ({ onEntityClick }: HistoryPageProps) => {
  const { thoughts, refreshThoughts, isLoading } = useThoughts();
  const { entities } = useEntities();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">Campaign History</CardTitle>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};