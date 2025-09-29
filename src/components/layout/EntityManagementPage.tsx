import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EntityList } from '@/components/display/EntityList';
import { EntityForm } from '@/components/forms/EntityForm';
import { useEntities } from '@/hooks/useEntities';
import { EntityType } from '@/types/entities';
import { Search, Plus, RefreshCw } from 'lucide-react';
import { syncService } from '@/services/syncService';
import { useToast } from '@/hooks/use-toast';

interface EntityManagementPageProps {
  onEntityClick?: (entityName: string) => void;
}

export const EntityManagementPage = ({ onEntityClick }: EntityManagementPageProps) => {
  const { entitiesWithMetrics, createEntity, refreshEntities, isLoading } = useEntities();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<EntityType | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await syncService.refreshFromServer();
      refreshEntities();
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

  const handleEntityCreate = async (name: string, type: EntityType, description?: string) => {
    await createEntity(name, type, description);
    setIsAddModalOpen(false);
  };

  const filteredEntities = entitiesWithMetrics
    .filter(entity => {
      const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || entity.type === selectedType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      // Sort by mention count (desc), then by last mentioned (desc), then by name
      if (a.metrics.count !== b.metrics.count) {
        return b.metrics.count - a.metrics.count;
      }
      if (a.metrics.lastMentioned && b.metrics.lastMentioned) {
        return b.metrics.lastMentioned.getTime() - a.metrics.lastMentioned.getTime();
      }
      return a.name.localeCompare(b.name);
    });

  const uniqueTypes: EntityType[] = ['character', 'location', 'organization', 'item'];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">Entity Registry</CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => setIsAddModalOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Entity
              </Button>
              <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search entities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedType === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedType('all')}
            >
              All ({entitiesWithMetrics.length})
            </Badge>
            {uniqueTypes.map((type) => {
              const count = entitiesWithMetrics.filter(e => e.type === type).length;
              return (
                <Badge
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  className="cursor-pointer capitalize"
                  onClick={() => setSelectedType(type)}
                >
                  {type} ({count})
                </Badge>
              );
            })}
          </div>

          <EntityList 
            entities={filteredEntities} 
            onEntityClick={onEntityClick}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Entity</DialogTitle>
          </DialogHeader>
          <EntityForm
            onSubmit={handleEntityCreate}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};