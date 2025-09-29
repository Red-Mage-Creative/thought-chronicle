import { useState, useMemo } from "react";
import { Search, RefreshCw, Users, MapPin, Package, Shield, Scroll, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocalEntities, useLocalThoughts } from "@/hooks/useOfflineData";
import { syncService } from "@/services/syncService";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { AddEntityModal } from "@/components/AddEntityModal";

interface EntityDashboardProps {
  onEntityClick?: (entity: string) => void;
}

// Helper function to categorize entities based on name patterns
const categorizeEntity = (entity: string): string => {
  const lower = entity.toLowerCase();
  if (['he', 'she', 'they', 'i'].some(pronoun => lower.includes(pronoun))) return 'player';
  if (['guild', 'faction', 'order', 'clan'].some(org => lower.includes(org))) return 'organization';
  if (['sword', 'armor', 'potion', 'ring', 'staff'].some(item => lower.includes(item))) return 'item';
  if (['city', 'town', 'forest', 'mountain', 'river'].some(loc => lower.includes(loc))) return 'location';
  return 'npc';
};

// Get icon for entity type
const getEntityIcon = (type: string) => {
  switch (type) {
    case 'player': return Users;
    case 'npc': return Users;
    case 'character': return Users;
    case 'location': return MapPin;
    case 'item': return Package;
    case 'organization': return Shield;
    default: return Scroll;
  }
};

const getEntityClass = (type: string): string => {
  switch (type) {
    case 'player': return 'entity-player';
    case 'npc': return 'entity-npc';
    case 'character': return 'entity-npc';
    case 'location': return 'entity-location';
    case 'item': return 'entity-item';
    case 'organization': return 'entity-organization';
    default: return 'entity-npc';
  }
};

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
            type: categorizeEntity(entityName),
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

  const uniqueTypes = Array.from(new Set(entitiesWithMetrics.map(e => e.type)));

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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search entities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("all")}
            >
              All ({entitiesWithMetrics.length})
            </Button>
            {uniqueTypes.map((type) => {
              const count = entitiesWithMetrics.filter(e => e.type === type).length;
              const Icon = getEntityIcon(type);
              return (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className="capitalize"
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {type} ({count})
                </Button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          {filteredEntities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No entities found. Start writing chronicles to create entities!
            </p>
          ) : (
            filteredEntities.map((entity) => {
              const Icon = getEntityIcon(entity.type);
              return (
                <div
                  key={entity.name}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => onEntityClick?.(entity.name)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">{entity.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Last mentioned: {entity.lastMentioned.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {entity.type}
                    </Badge>
                    <Badge variant="outline">
                      {entity.count} mention{entity.count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
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