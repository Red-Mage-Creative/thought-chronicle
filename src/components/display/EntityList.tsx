import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EntityWithMetrics, EntityType } from '@/types/entities';
import { Users, MapPin, Building, Sword, Calendar, Hash } from 'lucide-react';

interface EntityListProps {
  entities: EntityWithMetrics[];
  onEntityClick?: (entityName: string) => void;
  isLoading?: boolean;
}

const getEntityIcon = (type: EntityType) => {
  const icons = {
    character: Users,
    location: MapPin,
    organization: Building,
    item: Sword
  };
  return icons[type] || Users;
};

const getEntityClass = (type: EntityType): string => {
  const classes = {
    character: 'entity-tag entity-npc',
    location: 'entity-tag entity-location',
    organization: 'entity-tag entity-organization',
    item: 'entity-tag entity-item'
  };
  return classes[type] || 'entity-tag entity-npc';
};

export const EntityList = ({ entities, onEntityClick, isLoading }: EntityListProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (entities.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No entities found</h3>
          <p className="text-muted-foreground">
            Start by creating a thought with tags, or add entities directly to your registry.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {entities.map((entity) => {
        const Icon = getEntityIcon(entity.type);
        const entityClass = getEntityClass(entity.type);
        
        return (
          <Card 
            key={entity.localId || entity.id || entity.name} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onEntityClick?.(entity.name)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Icon className="h-4 w-4" />
                {entity.name}
                <Badge variant="secondary" className={entityClass}>
                  {entity.type}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {entity.metrics.lastMentioned && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Last mentioned: {entity.metrics.lastMentioned.toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Hash className="h-3 w-3" />
                <span>Mentioned {entity.metrics.count} time{entity.metrics.count !== 1 ? 's' : ''}</span>
              </div>
              {entity.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {entity.description}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};