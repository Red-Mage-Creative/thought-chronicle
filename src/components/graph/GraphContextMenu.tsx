import { GraphNode } from '@/utils/graphDataTransform';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, Edit, Plus, Focus, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GraphContextMenuProps {
  node: GraphNode | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onFocusEntity?: (entityId: string) => void;
  onHideEntity?: (entityId: string) => void;
}

export const GraphContextMenu = ({ 
  node, 
  position, 
  onClose,
  onFocusEntity,
  onHideEntity 
}: GraphContextMenuProps) => {
  const navigate = useNavigate();

  if (!node || !position) return null;

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  const isEntity = node.data.type === 'entity';
  const isThought = node.data.type === 'thought';

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Menu */}
      <Card 
        className="fixed z-50 w-56 shadow-lg"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <CardContent className="p-1">
          {isEntity && node.data.entityId && (
            <>
              <button
                className="w-full px-3 py-2 text-sm text-left hover:bg-muted rounded flex items-center gap-2"
                onClick={() => handleAction(() => navigate(`/entities/${node.data.entityId}`))}
              >
                <Eye className="h-4 w-4" />
                View Details
              </button>
              <button
                className="w-full px-3 py-2 text-sm text-left hover:bg-muted rounded flex items-center gap-2"
                onClick={() => handleAction(() => navigate(`/entities/${node.data.entityId}/edit`))}
              >
                <Edit className="h-4 w-4" />
                Edit Entity
              </button>
              <Separator className="my-1" />
              <button
                className="w-full px-3 py-2 text-sm text-left hover:bg-muted rounded flex items-center gap-2"
                onClick={() => handleAction(() => navigate('/entities/create'))}
              >
                <Plus className="h-4 w-4" />
                Create Related Entity
              </button>
              {onFocusEntity && (
                <>
                  <Separator className="my-1" />
                  <button
                    className="w-full px-3 py-2 text-sm text-left hover:bg-muted rounded flex items-center gap-2"
                    onClick={() => handleAction(() => onFocusEntity(node.data.entityId!))}
                  >
                    <Focus className="h-4 w-4" />
                    Focus on Entity
                  </button>
                </>
              )}
              {onHideEntity && (
                <button
                  className="w-full px-3 py-2 text-sm text-left hover:bg-muted rounded flex items-center gap-2"
                  onClick={() => handleAction(() => onHideEntity(node.data.entityId!))}
                >
                  <EyeOff className="h-4 w-4" />
                  Hide Entity
                </button>
              )}
            </>
          )}

          {isThought && node.data.thoughtId && (
            <button
              className="w-full px-3 py-2 text-sm text-left hover:bg-muted rounded flex items-center gap-2"
              onClick={() => handleAction(() => navigate(`/thoughts/${node.data.thoughtId}/edit`))}
            >
              <Edit className="h-4 w-4" />
              Edit Thought
            </button>
          )}
        </CardContent>
      </Card>
    </>
  );
};
