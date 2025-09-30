import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EntityWithMetrics } from '@/types/entities';
import { Users, Calendar, Clock, MessageSquare } from 'lucide-react';
import { getEntityIcon, getEntityClass } from '@/utils/entityUtils';
import { capitalize } from '@/utils/formatters';
import { format } from 'date-fns';

interface EntityListProps {
  entities: EntityWithMetrics[];
  onEntityClick?: (entityName: string) => void;
  isLoading?: boolean;
}

export const EntityList = ({ entities, onEntityClick, isLoading }: EntityListProps) => {
  const handleEntityClick = (entityName: string) => {
    onEntityClick?.(entityName);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse p-4">
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (entities.length === 0) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No entities found</h3>
          <p className="text-muted-foreground">
            Start by creating a thought with tags, or add entities directly to your registry.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {entities.map((entity) => {
          const Icon = getEntityIcon(entity.type);

          return (
            <Tooltip key={entity.localId || entity.id}>
              <TooltipTrigger asChild>
                <Card 
                  className="p-4 flex flex-col cursor-pointer hover:bg-accent/10 transition-colors"
                  onClick={() => handleEntityClick(entity.name)}
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg break-words flex-1">{entity.name}</h3>
                    </div>

                    <div className="mb-2">
                      <Badge 
                        className={`text-xs ${getEntityClass(entity.type)} inline-flex items-center gap-1`}
                      >
                        <Icon className="h-3 w-3" />
                        {capitalize(entity.type)}
                      </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Mentioned {entity.metrics.count} time{entity.metrics.count !== 1 ? 's' : ''}</div>
                      {entity.metrics.lastMentioned && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {format(entity.metrics.lastMentioned, 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>

                    {entity.creationSource === 'auto' && (
                      <div className="text-xs text-muted-foreground italic">
                        Created from message tagging
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground mt-auto pt-2 border-t flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {entity.createdLocally ? format(entity.createdLocally, 'MMM d, yyyy') : 'Unknown'}
                      </div>
                      {entity.modifiedLocally && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(entity.modifiedLocally, 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>View details for {entity.name}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};