import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EntityWithMetrics, EntityType } from '@/types/entities';
import { Users, Edit, Trash2 } from 'lucide-react';
import { getEntityIcon, getEntityClass } from '@/utils/entityUtils';
import { EntityEditForm } from '@/components/forms/EntityEditForm';
import { entityService } from '@/services/entityService';
import { toast } from 'sonner';
import { capitalize } from '@/utils/formatters';
import { format } from 'date-fns';

interface EntityListProps {
  entities: EntityWithMetrics[];
  onEntityClick?: (entityName: string) => void;
  onEntityUpdate?: () => void;
  isLoading?: boolean;
}

export const EntityList = ({ entities, onEntityClick, onEntityUpdate, isLoading }: EntityListProps) => {
  const [editingEntity, setEditingEntity] = useState<EntityWithMetrics | null>(null);

  const handleEdit = (entity: EntityWithMetrics) => {
    setEditingEntity(entity);
  };

  const handleDelete = async (entity: EntityWithMetrics) => {
    const entityId = entity.localId || entity.id || '';
    if (!entityId) return;

    try {
      entityService.deleteEntity(entityId);
      onEntityUpdate?.();
      toast.success(`Entity "${entity.name}" deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete entity');
    }
  };

  const handleEditSubmit = async (name: string, type: EntityType, description?: string) => {
    if (!editingEntity) return;
    
    const entityId = editingEntity.localId || editingEntity.id || '';
    if (!entityId) return;

    try {
      entityService.updateEntity(entityId, { name, type, description });
      onEntityUpdate?.();
      setEditingEntity(null);
      toast.success(`Entity "${name}" updated successfully`);
    } catch (error) {
      toast.error('Failed to update entity');
    }
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
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {entities.map((entity) => {
          const Icon = getEntityIcon(entity.type);

          return (
          <Card key={entity.localId || entity.id} className="p-4 flex flex-col">
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Icon className="h-4 w-4 shrink-0" />
                  <h3 className="font-semibold text-lg truncate">{entity.name}</h3>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(entity)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(entity)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mb-2">
                <Badge 
                  variant="secondary"
                  className={`text-xs ${getEntityClass(entity.type)}`}
                >
                  {capitalize(entity.type)}
                </Badge>
              </div>

              <div className="text-sm text-muted-foreground mb-2">
                Mentioned {entity.metrics.count} time{entity.metrics.count !== 1 ? 's' : ''}
                {entity.metrics.lastMentioned && (
                  <span> • Last: {format(entity.metrics.lastMentioned, 'MMM d, yyyy')}</span>
                )}
              </div>

              {entity.description && (
                <p className="text-sm text-muted-foreground mb-3">{entity.description}</p>
              )}

              <div className="text-xs text-muted-foreground mt-auto pt-2 border-t">
                <div className="flex flex-col gap-1">
                  <div>
                    {entity.creationSource === 'auto' ? 'Created from message tagging' : 'Created manually'}
                  </div>
                  <div className="flex justify-between">
                    <span>Created: {entity.createdLocally ? format(entity.createdLocally, 'MMM d, yyyy') : 'Unknown'}</span>
                    {entity.modifiedLocally && (
                      <span>Updated: {format(entity.modifiedLocally, 'MMM d, yyyy')}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
          );
        })}
      </div>

      <Dialog open={!!editingEntity} onOpenChange={() => setEditingEntity(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Entity</DialogTitle>
          </DialogHeader>
          {editingEntity && (
            <EntityEditForm
              entity={editingEntity}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingEntity(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};