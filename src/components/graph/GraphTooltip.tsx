import { GraphNode } from '@/utils/graphDataTransform';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LocalEntity } from '@/types/entities';
import { LocalThought } from '@/types/thoughts';
import { Campaign } from '@/types/campaigns';
import { formatDate } from '@/utils/formatters';
import { capitalize } from '@/utils/formatters';

interface GraphTooltipProps {
  node: GraphNode | null;
  position: { x: number; y: number } | null;
}

export const GraphTooltip = ({ node, position }: GraphTooltipProps) => {
  if (!node || !position) return null;

  // Calculate safe position within viewport
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(position.x + 10, window.innerWidth - 250),
    top: Math.min(position.y + 10, window.innerHeight - 150),
    zIndex: 100,
    pointerEvents: 'none',
  };

  const renderContent = () => {
    if (node.data.type === 'campaign') {
      const campaign = node.data.originalData as Campaign;
      return (
        <>
          <div className="font-semibold text-card-foreground">{campaign.name}</div>
          <Badge variant="secondary" className="mt-1">Campaign</Badge>
          <p className="text-xs text-muted-foreground/70 mt-2">
            Click to view details
          </p>
        </>
      );
    }

    if (node.data.type === 'entity') {
      const entity = node.data.originalData as LocalEntity;
      return (
        <>
          <div className="font-semibold text-card-foreground">{entity.name}</div>
          <Badge variant="outline" className="mt-1">
            {capitalize(entity.type)}
          </Badge>
          <p className="text-xs text-muted-foreground/70 mt-2">
            Click to view details
          </p>
        </>
      );
    }

    if (node.data.type === 'thought') {
      const thought = node.data.originalData as LocalThought;
      return (
        <>
          <div className="font-semibold text-card-foreground">Thought</div>
          <Badge variant="secondary" className="mt-1">
            {formatDate(new Date(thought.timestamp))}
          </Badge>
          <p className="text-xs text-muted-foreground/70 mt-2">
            Click to view details
          </p>
        </>
      );
    }

    return null;
  };

  return (
    <div style={tooltipStyle}>
      <Card className="w-60 shadow-lg border-border bg-card">
        <CardContent className="p-3">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};
