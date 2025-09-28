import { useState } from "react";
import { Calendar, Clock, Hash, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useThoughtsSearch } from "@/hooks/useBuildshipData";

interface Thought {
  id: string;
  content: string;
  entities: string[];
  timestamp: Date;
  gameDate?: string;
}

interface ThoughtsListProps {
  onEntityClick?: (entity: string) => void;
}

export const ThoughtsList = ({ onEntityClick }: ThoughtsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  const { data: thoughts = [], isLoading, error } = useThoughtsSearch(searchTerm);

  const getEntityClass = (entityType: string): string => {
    if (entityType.includes('player') || entityType.includes('pc')) return 'entity-player';
    if (entityType.includes('npc') || entityType.includes('character')) return 'entity-npc';
    if (entityType.includes('location') || entityType.includes('place') || entityType.includes('city')) return 'entity-location';
    if (entityType.includes('item') || entityType.includes('weapon') || entityType.includes('artifact')) return 'entity-item';
    if (entityType.includes('guild') || entityType.includes('organization') || entityType.includes('faction')) return 'entity-organization';
    return 'entity-npc'; // default
  };

  // Filter by selected entity locally (since server search handles the main query)
  const filteredThoughts = thoughts.filter(thought => {
    const matchesEntity = !selectedEntity || thought.entities.includes(selectedEntity);
    return matchesEntity;
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const allEntities = Array.from(new Set(thoughts.flatMap(t => t.entities)));

  return (
    <Card className="p-6 bg-card border-border h-full">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-foreground">
          <Hash className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">History</h2>
        </div>

        <div className="space-y-3">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search thoughts and entities..."
            className="bg-input border-border text-foreground placeholder:text-muted-foreground"
          />

          {allEntities.length > 0 && (
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
                {allEntities.slice(0, 8).map(entity => (
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
          {error ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Error loading thoughts</p>
              <p className="text-xs mt-1">{error.message}</p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin" />
              <p>Loading thoughts...</p>
            </div>
          ) : filteredThoughts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No thoughts found</p>
              <p className="text-xs mt-1">Try adjusting your search</p>
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

                  {thought.entities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {thought.entities.map(entity => (
                        <Badge
                          key={entity}
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