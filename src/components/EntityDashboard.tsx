import { useState } from "react";
import { Search, Users, MapPin, Package, Building, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Thought {
  id: string;
  content: string;
  entities: string[];
  timestamp: Date;
  gameDate?: string;
}

interface EntityDashboardProps {
  thoughts: Thought[];
  onEntityClick?: (entity: string) => void;
}

export const EntityDashboard = ({ thoughts, onEntityClick }: EntityDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Extract and categorize all entities
  const entityCounts = thoughts.reduce((acc, thought) => {
    thought.entities.forEach(entity => {
      if (!acc[entity]) {
        acc[entity] = { count: 0, lastMentioned: thought.timestamp, type: categorizeEntity(entity) };
      }
      acc[entity].count++;
      if (thought.timestamp > acc[entity].lastMentioned) {
        acc[entity].lastMentioned = thought.timestamp;
      }
    });
    return acc;
  }, {} as Record<string, { count: number; lastMentioned: Date; type: string }>);

  const categorizeEntity = (entity: string): string => {
    if (entity.includes('player') || entity.includes('pc')) return 'player';
    if (entity.includes('npc') || entity.includes('character')) return 'npc';
    if (entity.includes('location') || entity.includes('place') || entity.includes('city')) return 'location';
    if (entity.includes('item') || entity.includes('weapon') || entity.includes('artifact')) return 'item';
    if (entity.includes('guild') || entity.includes('organization') || entity.includes('faction')) return 'organization';
    return 'npc'; // default
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'player': return <User className="h-4 w-4" />;
      case 'npc': return <Users className="h-4 w-4" />;
      case 'location': return <MapPin className="h-4 w-4" />;
      case 'item': return <Package className="h-4 w-4" />;
      case 'organization': return <Building className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getEntityClass = (type: string): string => {
    switch (type) {
      case 'player': return 'entity-player';
      case 'npc': return 'entity-npc';
      case 'location': return 'entity-location';
      case 'item': return 'entity-item';
      case 'organization': return 'entity-organization';
      default: return 'entity-npc';
    }
  };

  const filteredEntities = Object.entries(entityCounts)
    .filter(([entity, data]) => {
      const matchesSearch = entity.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !selectedType || data.type === selectedType;
      return matchesSearch && matchesType;
    })
    .sort(([, a], [, b]) => b.count - a.count);

  const entityTypes = ['player', 'npc', 'location', 'item', 'organization'];

  return (
    <Card className="p-6 bg-card border-border h-full">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-foreground">
          <Search className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Entities</h2>
        </div>

        <div className="space-y-3">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search entities..."
            className="bg-input border-border text-foreground placeholder:text-muted-foreground"
          />

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedType === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(null)}
              className="text-xs"
            >
              All
            </Button>
            {entityTypes.map(type => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(selectedType === type ? null : type)}
                className="text-xs"
              >
                {getEntityIcon(type)}
                <span className="ml-1 capitalize">{type}s</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto fantasy-scrollbar">
          {filteredEntities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No entities found</p>
              <p className="text-xs mt-1">Start recording thoughts with #tags to create entities</p>
            </div>
          ) : (
            filteredEntities.map(([entity, data]) => (
              <div
                key={entity}
                onClick={() => onEntityClick?.(entity)}
                className="flex items-center justify-between p-3 bg-muted/30 border border-border hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-muted-foreground">
                    {getEntityIcon(data.type)}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">#{entity}</div>
                    <div className="text-xs text-muted-foreground">
                      Last mentioned: {data.lastMentioned.toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`entity-tag ${getEntityClass(data.type)}`}>
                    {data.type}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {data.count}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
};