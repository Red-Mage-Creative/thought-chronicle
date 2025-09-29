import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LocalThought } from '@/types/thoughts';

import { Clock, Calendar, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getEntityClass, getEntityIcon, inferEntityType } from '@/utils/entityUtils';
import { useNavigate } from 'react-router-dom';

interface ThoughtListProps {
  thoughts: LocalThought[];
  onEntityClick?: (entityName: string) => void;
  onEditThought?: (thought: LocalThought) => void;
  onDeleteThought?: (thoughtId: string) => void;
  isLoading?: boolean;
}


export const ThoughtList = ({ 
  thoughts, 
  onEntityClick, 
  onEditThought, 
  onDeleteThought, 
  isLoading 
}: ThoughtListProps) => {
  const navigate = useNavigate();
  
  const handleEntityClick = (entityName: string) => {
    // Navigate to entity details page
    navigate(`/entities/${encodeURIComponent(entityName)}`);
    // Also call the original handler for any other functionality
    onEntityClick?.(entityName);
  };
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (thoughts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No thoughts recorded</h3>
          <p className="text-muted-foreground">
            Start recording your campaign events and encounters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {thoughts.map((thought) => (
        <Card key={thought.localId || thought.id}>
          <CardContent className="p-4">
            <p className="text-foreground mb-3 leading-relaxed">
              {thought.content}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {thought.relatedEntities.map((entity) => {
                const entityType = inferEntityType(entity);
                const Icon = getEntityIcon(entityType);
                
                return (
                  <Badge
                    key={entity}
                    className={`cursor-pointer hover:opacity-80 transition-all hover:scale-105 ${getEntityClass(entityType)}`}
                    onClick={() => handleEntityClick(entity)}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {entity}
                  </Badge>
                );
              })}
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{thought.timestamp.toLocaleString()}</span>
                </div>
                {thought.gameDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{thought.gameDate}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {thought.syncStatus === 'pending' && (
                  <Badge variant="outline" className="text-xs">
                    Pending Sync
                  </Badge>
                )}
                {(onEditThought || onDeleteThought) && (
                  <div className="flex items-center gap-1">
                    {onEditThought && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onEditThought(thought)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                    {onDeleteThought && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                        onClick={() => onDeleteThought(thought.localId || thought.id!)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};