import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EntityWithMetrics } from '@/types/entities';
import { getEntityIcon, getEntityClass } from '@/utils/entityUtils';
import { Users } from 'lucide-react';
import { capitalize } from '@/utils/formatters';
import { format } from 'date-fns';

interface EntityTableViewProps {
  entities: EntityWithMetrics[];
  onEntityClick?: (entityName: string) => void;
  isLoading?: boolean;
}

export const EntityTableView = ({ entities, onEntityClick, isLoading }: EntityTableViewProps) => {

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
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-center">Mentions</TableHead>
            <TableHead>Last Mentioned</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entities.map((entity) => {
            const Icon = getEntityIcon(entity.type);
            
            return (
              <TableRow 
                key={entity.localId || entity.id || entity.name}
                className="cursor-pointer hover:bg-accent/50"
                onClick={() => onEntityClick?.(entity.name)}
              >
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{entity.name}</div>
                    {entity.description && (
                      <div className="text-sm text-muted-foreground">{entity.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={`${getEntityClass(entity.type)} inline-flex items-center gap-1`}>
                    <Icon className="h-3 w-3" />
                    {capitalize(entity.type)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {entity.metrics.count}
                </TableCell>
                <TableCell>
                  {entity.metrics.lastMentioned ? 
                    format(entity.metrics.lastMentioned, 'MMM d, yyyy') : 
                    'Never'
                  }
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {entity.creationSource === 'auto' ? 'Auto-created' : 'Manual'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {entity.createdLocally ? format(entity.createdLocally, 'MMM d, yyyy') : 'Unknown'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {entity.modifiedLocally ? format(entity.modifiedLocally, 'MMM d, yyyy') : '-'}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground cursor-pointer hover:text-primary">
                    View Details
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

    </>
  );
};