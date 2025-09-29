import { useState, useMemo } from "react";
import { Calendar, Clock, Hash, Loader2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocalThoughts } from "@/hooks/useOfflineData";
import { syncService } from "@/services/syncService";
import { toast } from "sonner";

interface Thought {
  id: string;
  content: string;
  relatedEntities: string[];
  timestamp: Date;
  gameDate?: string;
}

interface ThoughtsListProps {
  onEntityClick?: (entity: string) => void;
}

export const ThoughtsList = ({ onEntityClick }: ThoughtsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { thoughts: localThoughts } = useLocalThoughts();

  const getEntityClass = (entityType: string): string => {
    if (entityType.includes('player') || entityType.includes('pc')) return 'entity-player';
    if (entityType.includes('npc') || entityType.includes('character')) return 'entity-npc';
    if (entityType.includes('location') || entityType.includes('place') || entityType.includes('city')) return 'entity-location';
    if (entityType.includes('item') || entityType.includes('weapon') || entityType.includes('artifact')) return 'entity-item';
    if (entityType.includes('guild') || entityType.includes('organization') || entityType.includes('faction')) return 'entity-organization';
    return 'entity-npc'; // default
  };

  // Filter local thoughts based on search and selected entity
  const filteredThoughts = useMemo(() => {
    let filtered = localThoughts;
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(thought => {
        const entities = thought.relatedEntities || [];
        return thought.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entities.some(entity => entity.toLowerCase().includes(searchTerm.toLowerCase()));
      });
    }
    
    // Apply entity filter
    if (selectedEntity) {
      filtered = filtered.filter(thought => {
        const entities = thought.relatedEntities || [];
        return entities.includes(selectedEntity);
      });
    }
    
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [localThoughts, searchTerm, selectedEntity]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const result = await syncService.refreshFromServer();
      if (result.success) {
        toast.success("Archives updated successfully");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to refresh chronicles");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get unique entities from all local thoughts for filter buttons
  const uniqueEntities = Array.from(new Set(localThoughts.flatMap(t => t.relatedEntities || [])));

  return (
    <Card className="p-6 bg-card border-border h-full">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-foreground">
          <Hash className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">History</h2>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search thoughts and entities..."
              className="bg-input border-border text-foreground placeholder:text-muted-foreground flex-1"
            />
            <Button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="icon"
              title="Refresh Archives"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {uniqueEntities.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Filter by entity:</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedEntity === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedEntity(null)}
                  className="text-xs"
                >
                  All
                </Button>
                {uniqueEntities.slice(0, 8).map(entity => (
                  <Button
                    key={entity}
                    variant={selectedEntity === entity ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedEntity(selectedEntity === entity ? null : entity)}
                    className="text-xs"
                  >
                    #{entity}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto fantasy-scrollbar">
          {filteredThoughts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No thoughts found</p>
              <p className="text-xs mt-1">
                {searchTerm || selectedEntity ? "Try adjusting your search" : "Start adding thoughts to see them here"}
              </p>
            </div>
          ) : (
            filteredThoughts.map(thought => (
              <div
                key={thought.id}
                className="p-4 bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {thought.timestamp.toLocaleString()}
                      </div>
                      {thought.gameDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {thought.gameDate}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-foreground text-sm leading-relaxed">
                    {thought.content}
                  </div>

                  {(thought.relatedEntities || []).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {(thought.relatedEntities || []).map((entity, index) => (
                        <Badge
                          key={`${thought.id}-${entity}-${index}`}
                          variant="outline"
                          className={`entity-tag ${getEntityClass(entity)} text-xs cursor-pointer hover:opacity-80`}
                          onClick={() => onEntityClick?.(entity)}
                        >
                          #{entity}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
};