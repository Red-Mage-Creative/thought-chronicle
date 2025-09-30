import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LocalEntity } from '@/types/entities';
import { getEntityIcon, getEntityClass } from '@/utils/entityUtils';
import { capitalize } from '@/utils/formatters';

interface EntityRelationshipDisplayProps {
  title: string;
  icon: LucideIcon;
  entities: LocalEntity[];
  emptyMessage: string;
  onEntityClick?: (entityName: string) => void;
}

export const EntityRelationshipDisplay = ({
  title,
  icon: Icon,
  entities,
  emptyMessage,
  onEntityClick,
}: EntityRelationshipDisplayProps) => {
  if (entities.length === 0) {
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
    <div>
      <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4" />
        {title} ({entities.length})
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
      </div>
    </div>
  );
};
