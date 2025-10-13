import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, Users, Link as LinkIcon, MessageSquare } from 'lucide-react';
import { GraphNode, GraphEdge } from '@/utils/graphDataTransform';

interface SimpleGraphListProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * SimpleGraphList - Fallback component when WebGL graph cannot render
 * 
 * Shows the same data as EntityGraph but in a simple list format.
 * Used when WebGL is unavailable or GraphCanvas crashes.
 */
export const SimpleGraphList = ({ nodes, edges }: SimpleGraphListProps) => {
  // Group nodes by type
  const campaignNodes = nodes.filter(n => n.data.type === 'campaign');
  const entityNodes = nodes.filter(n => n.data.type === 'entity');
  const thoughtNodes = nodes.filter(n => n.data.type === 'thought');

  return (
    <div className="w-full h-full overflow-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Simple Graph View
          </CardTitle>
          <CardDescription>
            WebGL graph unavailable - showing simplified list view
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{nodes.length}</div>
              <div className="text-xs text-muted-foreground">Total Nodes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{edges.length}</div>
              <div className="text-xs text-muted-foreground">Total Edges</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{entityNodes.length}</div>
              <div className="text-xs text-muted-foreground">Entities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{thoughtNodes.length}</div>
              <div className="text-xs text-muted-foreground">Thoughts</div>
            </div>
          </div>

          {/* Campaign Nodes */}
          {campaignNodes.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Network className="h-4 w-4 text-primary" />
                Campaign
              </h3>
              <div className="space-y-1">
                {campaignNodes.map(node => (
                  <div key={node.id} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50">
                    <Badge variant="outline">{node.label}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Entity Nodes */}
          {entityNodes.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Entities ({entityNodes.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-auto">
                {entityNodes.slice(0, 20).map(node => (
                  <div key={node.id} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50">
                    <Badge variant="secondary" className="text-xs">
                      {node.data?.entityType || 'unknown'}
                    </Badge>
                    <span className="truncate">{node.label}</span>
                  </div>
                ))}
                {entityNodes.length > 20 && (
                  <div className="text-xs text-muted-foreground p-2">
                    ...and {entityNodes.length - 20} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Thought Nodes */}
          {thoughtNodes.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Thoughts ({thoughtNodes.length})
              </h3>
              <div className="space-y-1 max-h-64 overflow-auto">
                {thoughtNodes.slice(0, 10).map(node => (
                  <div key={node.id} className="text-sm p-2 rounded bg-muted/50 truncate">
                    {node.label}
                  </div>
                ))}
                {thoughtNodes.length > 10 && (
                  <div className="text-xs text-muted-foreground p-2">
                    ...and {thoughtNodes.length - 10} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sample Edges */}
          {edges.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-primary" />
                Relationships ({edges.length})
              </h3>
              <div className="space-y-1 max-h-40 overflow-auto">
                {edges.slice(0, 10).map(edge => (
                  <div key={edge.id} className="text-xs p-2 rounded bg-muted/50 font-mono">
                    {edge.source} → {edge.target}
                    {edge.label && <span className="text-muted-foreground ml-2">({edge.label})</span>}
                  </div>
                ))}
                {edges.length > 10 && (
                  <div className="text-xs text-muted-foreground p-2">
                    ...and {edges.length - 10} more
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
