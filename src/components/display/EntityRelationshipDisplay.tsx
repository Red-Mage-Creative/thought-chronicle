import { LucideIcon, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LocalEntity } from '@/types/entities';
import { getEntityIcon, getEntityClass } from '@/utils/entityUtils';
import { capitalize } from '@/utils/formatters';

interface EntityRelationshipDisplayProps {
  title: string;
  icon: LucideIcon;
  entities: LocalEntity[];
  orphanedIds?: string[];
  emptyMessage: string;
  onEntityClick?: (entityName: string) => void;
}

export const EntityRelationshipDisplay = ({
  title,
  icon: Icon,
  entities,
  orphanedIds = [],
  emptyMessage,
  onEntityClick,
}: EntityRelationshipDisplayProps) => {
  const hasOrphans = orphanedIds.length > 0;
  const totalCount = entities.length + orphanedIds.length;

  if (totalCount === 0) {
    return (
      <div>
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
          <Icon className="h-4 w-4" />
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div>
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
          <Icon className="h-4 w-4" />
          {title} ({hasOrphans ? `${entities.length} valid${orphanedIds.length > 0 ? `, ${orphanedIds.length} orphaned` : ''}` : entities.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {entities.map((entity) => {
            const EntityIcon = getEntityIcon(entity.type);
            return (
              <Badge
                key={entity.name}
                variant="secondary"
                className={`${getEntityClass(entity.type)} ${
                  onEntityClick ? 'cursor-pointer hover:opacity-80' : ''
                } inline-flex items-center gap-1`}
                onClick={() => onEntityClick?.(entity.name)}
              >
                <EntityIcon className="h-3 w-3" />
                {entity.name}
                <span className="text-xs opacity-70">({capitalize(entity.type)})</span>
              </Badge>
            );
          })}
          {orphanedIds.map((id) => (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <Badge
                  variant="secondary"
                  className="bg-muted/50 border border-dashed border-muted-foreground/30 text-muted-foreground inline-flex items-center gap-1"
                  aria-label="Orphaned reference to deleted entity"
                >
                  <AlertTriangle className="h-3 w-3" />
                  Unknown Entity
                  <span className="text-xs opacity-70">(ID: {id.slice(0, 8)}...)</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  This reference points to an entity that no longer exists. The entity may have been deleted or the data may be corrupted. You can remove this reference by editing the entity.
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};
