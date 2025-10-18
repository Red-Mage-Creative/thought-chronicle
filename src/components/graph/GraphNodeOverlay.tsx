import { useEffect, useState, useRef } from 'react';
import { getEntityTypeIcon } from '@/config/entityTypeConfig';
import { GraphNode } from '@/utils/graphDataTransform';
import { EntityType } from '@/types/entities';

interface GraphNodeOverlayProps {
  graphRef: any;
  nodes: GraphNode[];
}

export const GraphNodeOverlay = ({ graphRef, nodes }: GraphNodeOverlayProps) => {
  const [positions, setPositions] = useState<Map<string, {x: number, y: number, zoom: number}>>(new Map());
  const rafRef = useRef<number>();

  useEffect(() => {
    const updatePositions = () => {
      if (!graphRef.current) {
        rafRef.current = requestAnimationFrame(updatePositions);
        return;
      }
      
      const newPositions = new Map();
      const zoom = graphRef.current.zoom();
      
      nodes.forEach(node => {
        if (node.data.type === 'entity' && (node as any).x !== undefined && (node as any).y !== undefined) {
          const screenCoords = graphRef.current.graph2ScreenCoords((node as any).x, (node as any).y);
          newPositions.set(node.id, {
            x: screenCoords.x,
            y: screenCoords.y,
            zoom
          });
        }
      });
      
      setPositions(newPositions);
      rafRef.current = requestAnimationFrame(updatePositions);
    };
    
    updatePositions();
    
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [graphRef, nodes]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from(positions.entries()).map(([nodeId, pos]) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node || node.data.type !== 'entity' || !node.data.entityType) return null;
        
        const Icon = getEntityTypeIcon(node.data.entityType as EntityType);
        if (!Icon) return null;
        
        const size = Math.max(12, 12 * Math.min(pos.zoom, 3));
        
        return (
          <div
            key={nodeId}
            className="absolute transition-opacity duration-200"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transform: 'translate(-50%, -50%)',
              width: `${size}px`,
              height: `${size}px`,
            }}
          >
            <Icon className="w-full h-full text-white drop-shadow-lg" />
          </div>
        );
      })}
    </div>
  );
};
