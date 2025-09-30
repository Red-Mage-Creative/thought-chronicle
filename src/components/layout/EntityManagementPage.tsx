import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EntitySearch } from '@/components/display/EntitySearch';
import { EntityFilters } from '@/components/display/EntityFilters';
import { EntityList } from '@/components/display/EntityList';
import { EntityTableView } from '@/components/display/EntityTableView';
import { UncategorizedNotice } from '@/components/ui/uncategorized-notice';
import { useEntities } from '@/hooks/useEntities';
import { useSyncState } from '@/hooks/useSyncState';
import { useNavigationState } from '@/hooks/useNavigationState';
import { syncService } from '@/services/syncService';
import { toast } from 'sonner';
import { EntityType } from '@/types/entities';
import { RefreshCw, Plus, Grid3X3, Table2, ArrowUpDown } from 'lucide-react';

interface EntityManagementPageProps {
  onEntityClick?: (entityName: string) => void;
}

export const EntityManagementPage = ({ onEntityClick }: EntityManagementPageProps) => {
  const { navigateWithContext, restoreContext } = useNavigationState();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<EntityType | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortBy, setSortBy] = useState<'alphabetical' | 'mentions' | 'created' | 'updated' | 'lastMentioned'>('alphabetical');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showUncategorized, setShowUncategorized] = useState(false);

  const { entitiesWithMetrics, refreshEntities, isLoading } = useEntities();
  const { syncStatus } = useSyncState();

  // Restore context when returning from edit/create page
  useEffect(() => {
    const restored = restoreContext('/entities');
    if (restored) {
      if (restored.searchTerm) setSearchTerm(restored.searchTerm);
      if (restored.selectedType) setSelectedType(restored.selectedType as EntityType);
      if (restored.viewMode) setViewMode(restored.viewMode as 'cards' | 'table');
      if (restored.sortBy) setSortBy(restored.sortBy as typeof sortBy);
      if (restored.sortOrder) setSortOrder(restored.sortOrder as 'asc' | 'desc');
      if (restored.showUncategorized !== undefined) setShowUncategorized(restored.showUncategorized);
      
      // Restore scroll position
      if (restored.scrollY) {
        setTimeout(() => window.scrollTo(0, restored.scrollY), 0);
      }
    }
  }, []);

  const handleRefresh = async () => {
    if (syncStatus.pendingChanges > 0) {
      toast.warning('Sync pending changes first to avoid conflicts');
      return;
    }

    setIsRefreshing(true);
    try {
      await syncService.refreshFromServer();
      refreshEntities();
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Refresh failed:', error);
      toast.error('Refresh failed. Check your connection.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddEntity = () => {
    navigateWithContext('/entities/new', {
      searchTerm,
      selectedType,
      viewMode,
      sortBy,
      sortOrder,
      showUncategorized,
      scrollY: window.scrollY
    });
  };

  const filteredEntities = useMemo(() => {
    return entitiesWithMetrics
      .filter(entity => {
        const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !selectedType || entity.type === selectedType;
        const matchesUncategorized = showUncategorized ? entity.type === 'uncategorized' : entity.type !== 'uncategorized';
        return matchesSearch && matchesType && matchesUncategorized;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'alphabetical':
            const nameCompare = a.name.localeCompare(b.name);
            return sortOrder === 'asc' ? nameCompare : -nameCompare;
          case 'mentions':
            const mentionCompare = b.metrics.count - a.metrics.count;
            return sortOrder === 'asc' ? -mentionCompare : mentionCompare;
          case 'created':
            const aCreated = a.createdLocally?.getTime() || 0;
            const bCreated = b.createdLocally?.getTime() || 0;
            const createdCompare = bCreated - aCreated;
            return sortOrder === 'asc' ? -createdCompare : createdCompare;
          case 'updated':
            const aUpdated = a.modifiedLocally?.getTime() || 0;
            const bUpdated = b.modifiedLocally?.getTime() || 0;
            const updatedCompare = bUpdated - aUpdated;
            return sortOrder === 'asc' ? -updatedCompare : updatedCompare;
          case 'lastMentioned':
            const aLastMentioned = a.metrics.lastMentioned?.getTime() || 0;
            const bLastMentioned = b.metrics.lastMentioned?.getTime() || 0;
            const lastMentionedCompare = bLastMentioned - aLastMentioned;
            return sortOrder === 'asc' ? -lastMentionedCompare : lastMentionedCompare;
          default:
            return 0;
        }
      });
  }, [entitiesWithMetrics, searchTerm, selectedType, showUncategorized, sortBy, sortOrder]);

  const entityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    entitiesWithMetrics.forEach(entity => {
      if (entity.type !== 'uncategorized') {
        counts[entity.type] = (counts[entity.type] || 0) + 1;
      }
    });
    return counts;
  }, [entitiesWithMetrics]);

  const uncategorizedCount = entitiesWithMetrics.filter(e => e.type === 'uncategorized').length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Entity Registry</CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleAddEntity} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Entity
              </Button>
              <Button 
                variant="outline" 
                onClick={handleRefresh} 
                disabled={isRefreshing} 
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <EntitySearch 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <EntityFilters
            selectedType={selectedType}
            onTypeChange={(type) => setSelectedType(type as EntityType | null)}
            entityCounts={entityCounts}
          />

          {/* Sort Controls and View Mode Toggle - Combined */}
          <div className="flex items-center justify-between pt-4 border-t border-muted/30">
            <div className="flex items-center gap-2">
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [newSortBy, newSortOrder] = value.split('-') as [typeof sortBy, typeof sortOrder];
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}>
                <SelectTrigger className="w-48">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alphabetical-asc">Alphabetical (A-Z)</SelectItem>
                  <SelectItem value="alphabetical-desc">Alphabetical (Z-A)</SelectItem>
                  <SelectItem value="mentions-desc">Most Mentioned</SelectItem>
                  <SelectItem value="mentions-asc">Least Mentioned</SelectItem>
                  <SelectItem value="lastMentioned-desc">Mentioned (New → Old)</SelectItem>
                  <SelectItem value="lastMentioned-asc">Mentioned (Old → New)</SelectItem>
                  <SelectItem value="created-desc">Created (New → Old)</SelectItem>
                  <SelectItem value="created-asc">Created (Old → New)</SelectItem>
                  <SelectItem value="updated-desc">Updated (New → Old)</SelectItem>
                  <SelectItem value="updated-asc">Updated (Old → New)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1 bg-muted/50 rounded-md p-1">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="h-8"
              >
                <Grid3X3 className="h-4 w-4 mr-1" />
                Cards
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="h-8"
              >
                <Table2 className="h-4 w-4 mr-1" />
                Table
              </Button>
            </div>
          </div>

        {uncategorizedCount > 0 && (
          <UncategorizedNotice 
            count={uncategorizedCount} 
            className="mb-6"
            onShowUncategorized={() => setShowUncategorized(!showUncategorized)}
          />
        )}

          {viewMode === 'cards' ? (
            <EntityList
              entities={filteredEntities}
              onEntityClick={onEntityClick}
              isLoading={isLoading}
            />
          ) : (
            <EntityTableView
              entities={filteredEntities}
              onEntityClick={onEntityClick}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
};