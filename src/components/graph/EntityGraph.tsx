import { LocalEntity } from '@/types/entities';
import { LocalThought } from '@/types/thoughts';
import { Campaign } from '@/types/campaigns';
import { transformToGraphData, getNodeColor, getNodeSize } from '@/utils/graphDataTransform';
import { GraphCanvas, GraphEdge as ReaGraphEdge, GraphNode as ReaGraphNode } from 'reagraph';
import { useRef } from 'react';
import { GraphControls } from './GraphControls';

interface EntityGraphProps {
  campaign: Campaign | null;
  entities: LocalEntity[];
  thoughts: LocalThought[];
}

export const EntityGraph = ({ campaign, entities, thoughts }: EntityGraphProps) => {
  const graphRef = useRef<any>(null);

  const graphData = transformToGraphData(campaign, entities, thoughts);

  // Transform to reagraph format
  const nodes: ReaGraphNode[] = graphData.nodes.map(node => ({
    id: node.id,
    label: node.label,
    fill: getNodeColor(node),
    size: getNodeSize(node),
    data: node.data
  }));

  const edges: ReaGraphEdge[] = graphData.edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    data: edge.data
  }));

  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoomOut();
    }
  };

  const handleFitView = () => {
    if (graphRef.current) {
      graphRef.current.fitNodesInView();
    }
  };

  const handleReset = () => {
    if (graphRef.current) {
      graphRef.current.centerGraph();
    }
  };

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">No Data to Display</h3>
          <p className="text-sm text-muted-foreground">
            Create entities and thoughts to see them in the graph view.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <GraphCanvas
        ref={graphRef}
        nodes={nodes}
        edges={edges}
        labelType="all"
        layoutType="forceDirected2d"
        draggable
        animated={false}
        edgeInterpolation="curved"
      />
      <GraphControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onReset={handleReset}
      />
    </div>
  );
};
