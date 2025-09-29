import { useState, useMemo } from "react";
import { RefreshCw, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocalEntities, useLocalThoughts } from "@/hooks/useOfflineData";
import { syncService } from "@/services/syncService";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { AddEntityModal } from "@/components/AddEntityModal";
import { EntitySearch } from "@/components/display/EntitySearch";
import { EntityFilters } from "@/components/display/EntityFilters";
import { EntityGrid } from "@/components/display/EntityGrid";
import { inferEntityType } from "@/utils/entityUtils";

interface EntityDashboardProps {
  onEntityClick?: (entity: string) => void;
}

export const EntityDashboard = ({ onEntityClick }: EntityDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRefreshConfirm, setShowRefreshConfirm] = useState(false);
  const [showAddEntity, setShowAddEntity] = useState(false);

  const { entities: localEntities, refreshFromStorage } = useLocalEntities();
  const { thoughts: localThoughts } = useLocalThoughts();

  // Calculate entity metrics from local entities and thought mentions
  const entitiesWithMetrics = useMemo(() => {
    const entityMap = new Map<string, { 
      name: string; 
      type: string; 
      count: number; 
      lastMentioned: Date;
    }>();

    // Start with all local entities
    localEntities.forEach(entity => {
      entityMap.set(entity.name.toLowerCase(), {
        name: entity.name,
        type: entity.type,
        count: 0,
        lastMentioned: entity.lastMentioned
      });
    });

    // Add mentioned-only entities from thoughts and update counts
    localThoughts.forEach(thought => {
      const entities = thought.relatedEntities || [];
      entities.forEach(entityName => {
        const key = entityName.toLowerCase();
        const existing = entityMap.get(key);
        
        if (existing) {
          // Update existing entity
          existing.count++;
          if (thought.timestamp > existing.lastMentioned) {
            existing.lastMentioned = thought.timestamp;
          }
        } else {
          // Add mentioned-only entity
          entityMap.set(key, {
            name: entityName,
            type: inferEntityType(entityName),
            count: 1,
            lastMentioned: thought.timestamp
          });
        }
      });
    });

    return Array.from(entityMap.values());
  }, [localEntities, localThoughts]);

  // Filter entities based on search and selected type
  const filteredEntities = useMemo(() => {
    let filtered = entitiesWithMetrics;

    if (searchTerm) {
      filtered = filtered.filter(entity =>
        entity.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== "all") {
      filtered = filtered.filter(entity => entity.type === selectedType);
    }

    // Sort by count (descending) then by name
    return filtered.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [entitiesWithMetrics, searchTerm, selectedType]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const result = await syncService.refreshFromServer();
      if (result.success) {
        refreshFromStorage();
        toast.success(`Refreshed ${result.syncedCount} records from server`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to refresh from server");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEntityAdded = () => {
    refreshFromStorage();
  };

  // Calculate entity counts by type
  const entityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    entitiesWithMetrics.forEach(entity => {
      counts[entity.type] = (counts[entity.type] || 0) + 1;
    });
    return counts;
  }, [entitiesWithMetrics]);

  return (
    <Card className="h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Entity Registry</h2>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAddEntity(true)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Entity
            </Button>
            <Button
              onClick={() => setShowRefreshConfirm(true)}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <EntitySearch 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
          
          <EntityFilters
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            entityCounts={entityCounts}
            totalCount={entitiesWithMetrics.length}
          />
        </div>

        <EntityGrid
          entities={filteredEntities.map(entity => ({
            id: entity.name,
            localId: entity.name,
            name: entity.name,
            type: entity.type as any, // Type cast for compatibility
            description: '',
            syncStatus: 'synced' as const,
            metrics: {
              count: entity.count,
              lastMentioned: entity.lastMentioned
            }
          }))}
          onEntityClick={onEntityClick}
        />
      </div>

      <ConfirmationDialog
        open={showRefreshConfirm}
        onOpenChange={setShowRefreshConfirm}
        title="Refresh from Server"
        description="This will fetch the latest data from your MongoDB database. This may use your free cluster resources. Are you sure you want to continue?"
        confirmText="Yes, Refresh"
        cancelText="Cancel"
        onConfirm={handleRefresh}
      />

      <AddEntityModal
        open={showAddEntity}
        onOpenChange={setShowAddEntity}
        onEntityAdded={handleEntityAdded}
      />
    </Card>
  );
};