import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GraphLinkTooltipProps {
  link: any | null;
  position: { x: number; y: number } | null;
}

export const GraphLinkTooltip = ({ link, position }: GraphLinkTooltipProps) => {
  if (!link || !position) return null;

  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(position.x + 10, window.innerWidth - 200),
    top: Math.min(position.y + 10, window.innerHeight - 100),
    zIndex: 100,
    pointerEvents: 'none',
  };

  const getRelationshipLabel = (type: string) => {
    switch (type) {
      case 'parent':
        return 'Parent-Child';
      case 'linked':
        return 'Linked';
      case 'mention':
        return 'Mentioned In';
      default:
        return 'Related';
    }
  };

  const getRelationshipDescription = (type: string) => {
    switch (type) {
      case 'parent':
        return 'Hierarchical dependency relationship';
      case 'linked':
        return 'Associated entities';
      case 'mention':
        return 'Referenced in thought';
      default:
        return 'Connection';
    }
  };

  const relationshipType = link.data?.relationshipType || 'related';

  return (
    <div style={tooltipStyle}>
      <Card className="w-48 shadow-lg border-border bg-card">
        <CardContent className="p-2">
          <Badge variant="outline" className="mb-1">
            {getRelationshipLabel(relationshipType)}
          </Badge>
          <p className="text-xs text-muted-foreground/70">
            {getRelationshipDescription(relationshipType)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
