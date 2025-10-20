import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GraphNode } from '@/utils/graphDataTransform';
import { LocalEntity } from '@/types/entities';
import { LocalThought } from '@/types/thoughts';
import { getEntityTypeLabel } from '@/config/entityTypeConfig';
import { X, Edit, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface GraphSelectionPanelProps {
  selectedNode: GraphNode | null;
  onClose: () => void;
  connectedNodes: GraphNode[];
}

export const GraphSelectionPanel = ({ selectedNode, onClose, connectedNodes }: GraphSelectionPanelProps) => {
  const navigate = useNavigate();

  if (!selectedNode) return null;

  const { data } = selectedNode;
  const isEntity = data.type === 'entity';
  const isThought = data.type === 'thought';

  return (
    <div className={`fixed left-0 top-0 bottom-0 md:w-80 w-full bg-card border-r z-40 transition-transform duration-300 ${
      selectedNode ? 'translate-x-0' : '-translate-x-full'
    } overflow-y-auto`}>
      <Card className="h-full rounded-none border-0">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex-1 space-y-1">
            <CardTitle className="text-base">{selectedNode.label}</CardTitle>
            {isEntity && data.entityType && (
              <Badge variant="secondary" className="text-xs">
                {getEntityTypeLabel(data.entityType as any)}
              </Badge>
            )}
            {isThought && (
              <Badge variant="outline" className="text-xs">
                Thought
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Entity Details */}
          {isEntity && 'attributes' in data.originalData && (
            <>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Attributes</h4>
                {(data.originalData as LocalEntity).attributes?.length ? (
                  <div className="space-y-1 text-xs">
                    {(data.originalData as LocalEntity).attributes.map((attr, i) => (
                      <div key={i} className="flex gap-2 py-1">
                        <span className="font-medium text-muted-foreground">{attr.key}:</span>
                        <span>{attr.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No attributes</p>
                )}
              </div>

              {(data.originalData as LocalEntity).description && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Description</h4>
                    <p className="text-xs text-muted-foreground line-clamp-4">
                      {(data.originalData as LocalEntity).description}
                    </p>
                  </div>
                </>
              )}
            </>
          )}

          {/* Thought Details */}
          {isThought && 'content' in data.originalData && (
            <>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Content</h4>
                <p className="text-xs text-muted-foreground">
                  {(data.originalData as LocalThought).content}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {format((data.originalData as LocalThought).timestamp, 'PPP')}
              </div>
            </>
          )}

          {/* Connections */}
          {connectedNodes.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">
                  Connections ({connectedNodes.length})
                </h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {connectedNodes.map((node) => (
                    <Button
                      key={node.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs h-auto py-2"
                      onClick={() => {
                        if (node.data.entityId) {
                          navigate(`/entities/${node.data.entityId}`);
                        } else if (node.data.thoughtId) {
                          navigate(`/thoughts/${node.data.thoughtId}/edit`);
                        }
                      }}
                    >
                      <span className="truncate">{node.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <Separator />
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Actions</h4>
            <div className="flex flex-col gap-2">
              {isEntity && data.entityId && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => navigate(`/entities/${data.entityId}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => navigate(`/entities/${data.entityId}/edit`)}
                  >
                    <Edit className="h-3 w-3 mr-2" />
                    Edit Entity
                  </Button>
                </>
              )}
              {isThought && data.thoughtId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => navigate(`/thoughts/${data.thoughtId}/edit`)}
                >
                  <Edit className="h-3 w-3 mr-2" />
                  Edit Thought
                </Button>
              )}
              {isEntity && (
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => navigate('/entities/create')}
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Create Related
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
