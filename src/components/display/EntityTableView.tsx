import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EntityWithMetrics, EntityType } from '@/types/entities';
import { getEntityIcon, getEntityClass } from '@/utils/entityUtils';
import { EntityEditForm } from '@/components/forms/EntityEditForm';
import { entityService } from '@/services/entityService';
import { useToast } from '@/hooks/use-toast';
import { Edit2, Trash2, Users } from 'lucide-react';

interface EntityTableViewProps {
  entities: EntityWithMetrics[];
  onEntityClick?: (entityName: string) => void;
  onEntityUpdate?: () => void;
  isLoading?: boolean;
}

export const EntityTableView = ({ entities, onEntityClick, onEntityUpdate, isLoading }: EntityTableViewProps) => {
  const [editingEntity, setEditingEntity] = useState<EntityWithMetrics | null>(null);
  const { toast } = useToast();

  const handleEdit = (entity: EntityWithMetrics) => {
    setEditingEntity(entity);
  };

  const handleDelete = async (entity: EntityWithMetrics) => {
    const entityId = entity.localId || entity.id || '';
    if (!entityId) return;

    try {
      entityService.deleteEntity(entityId);
      onEntityUpdate?.();
      toast({
        title: 'Entity deleted',
        description: `"${entity.name}" has been removed from your registry.`
      });
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Could not delete entity. Please try again.',
        variant: 'destructive'
      });
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
      toast({
        title: 'Entity updated',
        description: `"${name}" has been updated successfully.`
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Could not update entity. Please try again.',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (entities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No entities found</h3>
        <p className="text-muted-foreground">
          Start by creating a thought with tags, or add entities directly to your registry.
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-center">Mentions</TableHead>
            <TableHead>Last Mentioned</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entities.map((entity) => {
            const Icon = getEntityIcon(entity.type);
            const entityClass = getEntityClass(entity.type);
            
            return (
              <TableRow 
                key={entity.localId || entity.id || entity.name}
                className="cursor-pointer"
                onClick={() => onEntityClick?.(entity.name)}
              >
                <TableCell>
                  <Icon className="h-4 w-4" />
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate font-medium">
                    {entity.name}
                  </div>
                  {entity.description && (
                    <div className="text-xs text-muted-foreground max-w-xs truncate">
                      {entity.description}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={entityClass}>
                    {entity.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {entity.metrics.count}
                </TableCell>
                <TableCell>
                  {entity.metrics.lastMentioned ? 
                    entity.metrics.lastMentioned.toLocaleDateString() : 
                    'Never'
                  }
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(entity);
                      }}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(entity);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

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