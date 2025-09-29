import { Badge } from '@/components/ui/badge';
import { getEntityIcon } from '@/utils/entityUtils';
import { formatDate, formatEntityCount, capitalize } from '@/utils/formatters';

interface EntityWithMetrics {
  name: string;
  type: string;
  count: number;
  lastMentioned: Date;
}

interface EntityGridProps {
  entities: EntityWithMetrics[];
  onEntityClick?: (entityName: string) => void;
}

export const EntityGrid = ({ entities, onEntityClick }: EntityGridProps) => {
  if (entities.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No entities found. Start writing chronicles to create entities!
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {entities.map((entity) => {
        const Icon = getEntityIcon(entity.type);
        return (
          <div
            key={entity.name}
            className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
            onClick={() => onEntityClick?.(entity.name)}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">{entity.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Last mentioned: {formatDate(entity.lastMentioned)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {capitalize(entity.type)}
              </Badge>
              <Badge variant="outline">
                {formatEntityCount(entity.count)}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
};