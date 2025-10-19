import { GraphNode } from '@/utils/graphDataTransform';
import { Badge } from '@/components/ui/badge';
import { LocalEntity } from '@/types/entities';
import { format } from 'date-fns';
import { getEntityTypeLabel } from '@/config/entityTypeConfig';

interface GraphTooltipProps {
  node: GraphNode | null;
  position: { x: number; y: number } | null;
}

export const GraphTooltip = ({ node, position }: GraphTooltipProps) => {
  if (!node || !position) return null;

  const { data } = node;
  
  // Determine safe position to avoid screen edges
  const maxWidth = 320;
  const safeX = position.x + maxWidth > window.innerWidth 
    ? position.x - maxWidth - 20 
    : position.x + 20;
  const safeY = position.y + 200 > window.innerHeight
    ? position.y - 100
    : position.y + 20;

  return (
    <div
      className="absolute z-30 bg-popover border border-border rounded-lg shadow-lg p-3 max-w-xs pointer-events-none"
      style={{
        left: `${safeX}px`,
        top: `${safeY}px`,
      }}
    >
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm line-clamp-2">{node.label}</h4>
          {data.type === 'entity' && data.entityType && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              {getEntityTypeLabel(data.entityType as any)}
            </Badge>
          )}
          {data.type === 'thought' && (
            <Badge variant="outline" className="shrink-0 text-xs">
              Thought
            </Badge>
          )}
          {data.type === 'campaign' && (
            <Badge className="shrink-0 text-xs bg-amber-500/20 text-amber-700 dark:text-amber-300">
              Campaign
            </Badge>
          )}
        </div>

        {/* Entity Details */}
        {data.type === 'entity' && 'attributes' in data.originalData && (
          <div className="text-xs text-muted-foreground space-y-1">
            {(data.originalData as LocalEntity).attributes
              ?.slice(0, 3)
              .map((attr, i) => (
                <div key={i} className="flex gap-2">
                  <span className="font-medium">{attr.key}:</span>
                  <span className="truncate">{attr.value}</span>
                </div>
              ))}
          </div>
        )}

        {/* Thought Details */}
        {data.type === 'thought' && 'timestamp' in data.originalData && (
          <div className="text-xs text-muted-foreground">
            {format((data.originalData as any).timestamp, 'MMM d, yyyy')}
          </div>
        )}

        {/* Connection Info */}
        {data.type === 'entity' && (
          <div className="text-xs text-muted-foreground pt-1 border-t">
            {data.thoughtCount ? (
              <span>{data.thoughtCount} thought{data.thoughtCount !== 1 ? 's' : ''}</span>
            ) : (
              <span>No thoughts yet</span>
            )}
          </div>
        )}

        {/* Hint */}
        <div className="text-xs text-muted-foreground/60 italic pt-1">
          Click to view details
        </div>
      </div>
    </div>
  );
};
