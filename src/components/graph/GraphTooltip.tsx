import { GraphNode } from '@/utils/graphDataTransform';

interface GraphTooltipProps {
  node: GraphNode | null;
  position: { x: number; y: number } | null;
}

// Tooltip removed - using canvas-only labels for stability
// Hover information is now shown directly on canvas in ForceGraph2DWrapper
export const GraphTooltip = ({ node, position }: GraphTooltipProps) => {
  return null;
};
